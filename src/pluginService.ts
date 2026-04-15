/**
 * PluginService (mirrors PluginService.kt).
 *
 * Fetches and caches GitHub Copilot premium quota data.
 * Emits quota-updated events so the status bar (and any other subscriber)
 * can react without polling.
 */

import * as https from 'https';
import { AuthService } from './authService';
import { t, tf } from './i18n';

const COPILOT_USER_API_URL = 'https://api.github.com/copilot_internal/user';

// ── Domain types ──────────────────────────────────────────────────────────────

export interface QuotaInfo {
    percentRemaining: number;
    renewalDate?: string;
    quotaRemaining?: number;
    quotaTotal?: number;
}

export type QuotaResult =
    | { kind: 'loading' }
    | { kind: 'available'; quota: QuotaInfo }
    | { kind: 'unlimited' }
    | { kind: 'noAccount'; message: string }
    | { kind: 'error'; message: string };

type QuotaListener = (result: QuotaResult) => void;

// ── Service ───────────────────────────────────────────────────────────────────

export class PluginService {
    private auth: AuthService;
    private readonly version: string;
    private cachedResult: QuotaResult = { kind: 'loading' };
    private isFetching = false;
    private listeners: QuotaListener[] = [];

    constructor(auth: AuthService, version: string) {
        this.auth    = auth;
        this.version = version;

        // Refresh quota whenever the user signs in or out.
        this.auth.onAuthStateChanged(() => {
            this.refreshQuota().catch(() => { /* best-effort */ });
        });
    }

    // ── Public API ─────────────────────────────────────────────────────���──────

    getCachedResult(): QuotaResult {
        return this.cachedResult;
    }

    onQuotaUpdated(listener: QuotaListener): () => void {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    async refreshQuota(): Promise<QuotaResult> {
        if (this.isFetching) { return this.cachedResult; }
        this.isFetching = true;

        try {
            const result = await this.fetchQuota();
            this.cachedResult = result;
            this.notifyListeners(result);
            return result;
        } finally {
            this.isFetching = false;
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async fetchQuota(): Promise<QuotaResult> {
        const token = await this.auth.getToken();
        if (!token) {
            return { kind: 'noAccount', message: t('general_not_signed_in') };
        }

        return new Promise(resolve => {
            let res: import('http').IncomingMessage | undefined;
            const req = https.request(COPILOT_USER_API_URL, {
                method: 'GET',
                headers: {
                    Authorization:            `token ${token}`,
                    Accept:                   'application/json',
                    'User-Agent':             `github-copilot-quota-monitor-vscode/${this.version}`,
                    'Copilot-Integration-Id': 'vscode',
                    'Connection':             'close',
                },
            }, incoming => {
                res = incoming;
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('error', (e: Error) => {
                    resolve({ kind: 'error', message: e.message ?? t('general_network_error') });
                });
                res.on('end', () => {
                    const code = res!.statusCode ?? 0;
                    if (code === 200) {
                        resolve(this.parseQuota(data));
                    } else if (code === 401 || code === 403) {
                        this.auth.clearAuthentication().catch(() => { /* best-effort */ });
                        resolve({ kind: 'noAccount', message: tf('general_token_invalid', code) });
                    } else {
                        resolve({ kind: 'error', message: tf('general_api_http', code) });
                    }
                });
            });

            req.on('error', (e: Error) => {
                resolve({ kind: 'error', message: e.message ?? t('general_network_error') });
            });
            req.setTimeout(10_000, () => {
                res?.destroy();
                req.destroy();
                resolve({ kind: 'error', message: t('general_network_error') });
            });
            req.end();
        });
    }

    private parseQuota(json: string): QuotaResult {
        try {
            const root = JSON.parse(json) as Record<string, unknown>;
            const quotaReset = root['quota_reset_date'] as string | undefined;

            return (
                this.parseModernFormat(root, quotaReset) ??
                this.parseLimitedUserQuotasFormat(root, quotaReset) ??
                this.parseNestedQuotaFormat(root, quotaReset) ??
                this.parseFlatQuotaFormat(root, quotaReset) ??
                { kind: 'unlimited' }
            );
        } catch (e: unknown) {
            return { kind: 'error', message: tf('general_parse_failed', e instanceof Error ? e.message : String(e)) };
        }
    }

    /** Modern API: quota_snapshots.premium_interactions.percent_remaining */
    private parseModernFormat(root: Record<string, unknown>, quotaReset?: string): QuotaResult | undefined {
        const snapshots = root['quota_snapshots'] as Record<string, unknown> | undefined;
        const premium   = snapshots?.['premium_interactions'] as Record<string, unknown> | undefined;
        if (!premium) { return undefined; }

        const pctRaw = premium['percent_remaining'] as number | undefined;
        if (pctRaw === undefined) { return undefined; }

        if (premium['unlimited'] === true) { return { kind: 'unlimited' }; }

        const pct        = Math.max(pctRaw, 0);
        const remaining  = Math.max((premium['quota_remaining'] as number | undefined) ?? 0, 0);
        const total      = (premium['entitlement'] ?? premium['quota_total']) as number | undefined;
        return { kind: 'available', quota: { percentRemaining: pct, renewalDate: quotaReset, quotaRemaining: remaining, quotaTotal: total } };
    }

    /** Legacy API: limited_user_quotas.premium_interactions or .completions */
    private parseLimitedUserQuotasFormat(root: Record<string, unknown>, quotaReset?: string): QuotaResult | undefined {
        const quotas        = root['limited_user_quotas'] as Record<string, unknown> | undefined;
        const interactions  = (quotas?.['premium_interactions'] ?? quotas?.['completions']) as Record<string, unknown> | undefined;
        if (!interactions) { return undefined; }

        const limit     = (interactions['limit'] ?? interactions['monthly_maximum']) as number | undefined;
        if (limit === undefined) { return undefined; }
        const used      = (interactions['used'] as number | undefined) ?? 0;
        const remaining = Math.max((interactions['remaining'] as number | undefined) ?? (limit - used), 0);
        const pct       = limit > 0 ? Math.max((remaining / limit) * 100, 0) : 0;
        return { kind: 'available', quota: { percentRemaining: pct, renewalDate: quotaReset, quotaRemaining: remaining, quotaTotal: limit } };
    }

    /** Older nested API: top-level quota / premium_interactions / premium_requests object */
    private parseNestedQuotaFormat(root: Record<string, unknown>, quotaReset?: string): QuotaResult | undefined {
        const quotaObj = (root['quota'] ?? root['premium_interactions'] ?? root['premium_requests']) as Record<string, unknown> | undefined;
        if (!quotaObj) { return undefined; }

        const total = (quotaObj['monthly_maximum'] ?? quotaObj['maximum'] ?? quotaObj['total'] ?? quotaObj['limit']) as number | undefined;
        if (total === undefined) { return undefined; }

        const used      = (quotaObj['used'] as number | undefined) ?? 0;
        const remaining = Math.max((quotaObj['remaining'] as number | undefined) ?? (total - used), 0);
        const pct       = total > 0 ? Math.max((remaining / total) * 100, 0) : 0;
        return { kind: 'available', quota: { percentRemaining: pct, renewalDate: quotaReset, quotaRemaining: remaining, quotaTotal: total } };
    }

    /** Flat-field API: premium_requests_maximum / monthly_maximum_premium_requests / premium_requests_monthly_limit */
    private parseFlatQuotaFormat(root: Record<string, unknown>, quotaReset?: string): QuotaResult | undefined {
        const max = (root['premium_requests_maximum'] ?? root['monthly_maximum_premium_requests'] ?? root['premium_requests_monthly_limit']) as number | undefined;
        if (max === undefined) { return undefined; }

        const used      = (root['premium_requests_used'] as number | undefined) ?? 0;
        const remaining = Math.max(max - used, 0);
        const pct       = max > 0 ? Math.max((remaining / max) * 100, 0) : 0;
        return { kind: 'available', quota: { percentRemaining: pct, renewalDate: quotaReset, quotaRemaining: remaining, quotaTotal: max } };
    }

    private notifyListeners(result: QuotaResult): void {
        for (const l of this.listeners) {
            try { l(result); } catch { /* best-effort */ }
        }
    }
}

