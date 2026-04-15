/**
 * AuthService (mirrors AuthService.kt).
 *
 * Implements the GitHub OAuth 2.0 Device Authorization Grant (RFC 8628).
 * Tokens are stored securely in VS Code's SecretStorage (OS keychain).
 * The username is stored in ExtensionContext.globalState.
 */

import * as https from 'https';
import * as vscode from 'vscode';
import { tf, t } from './i18n';

const CLIENT_ID = 'Iv1.b507a08c87ecfe98';
const SCOPE = 'read:user';

const DEVICE_CODE_URL  = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const USER_API_URL     = 'https://api.github.com/user';

const SECRET_KEY_TOKEN    = 'ghcp_oauth_token';
const STATE_KEY_USERNAME  = 'ghcp_username';

// ── Types ────────────────────────────────────────────────────────────���────────

export interface DeviceCodeResponse {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    interval: number;
    expiresIn: number;
}

export type PollResult =
    | { kind: 'success'; token: string }
    | { kind: 'pending' }
    | { kind: 'expired' }
    | { kind: 'error'; message: string };

// ── Auth state event emitter ──────────────────────────────────────────────────

type AuthStateListener = () => void;

// ── Service ───────────────────────────────────────────────────────────────────

export class AuthService {
    private secrets: vscode.SecretStorage;
    private globalState: vscode.Memento;
    private readonly version: string;

    // In-memory cache so callers on the main thread never need to await
    private cachedToken: string | undefined;
    private cachedUsername: string | undefined;

    private authListeners: AuthStateListener[] = [];

    constructor(context: vscode.ExtensionContext, version: string) {
        this.secrets     = context.secrets;
        this.globalState = context.globalState;
        this.version     = version;

        // Pre-load credentials asynchronously; callers can await isAuthenticated()
        // for a blocking check or use isAuthenticatedCached() after init.
        this.loadCached().catch(() => { /* best-effort */ });
    }

    // ── Initialisation ────────────────────────────────────────────────────────

    private async loadCached(): Promise<void> {
        try {
            this.cachedToken    = await this.secrets.get(SECRET_KEY_TOKEN);
            this.cachedUsername = this.globalState.get<string>(STATE_KEY_USERNAME);
        } catch {
            // Ignore — secrets may not be available yet on first run
        }
    }

    // ── Token store ───────────────────────────────────────────────────────────

    async getToken(): Promise<string | undefined> {
        const token = await this.secrets.get(SECRET_KEY_TOKEN);
        this.cachedToken = token;
        return token;
    }

    async isAuthenticated(): Promise<boolean> {
        return (await this.getToken()) !== undefined;
    }

    isAuthenticatedCached(): boolean {
        return this.cachedToken !== undefined;
    }

    getSavedUsername(): string | undefined {
        return this.cachedUsername;
    }

    async saveAuthentication(token: string): Promise<void> {
        this.cachedToken = token;
        await this.secrets.store(SECRET_KEY_TOKEN, token);

        const username = await this.fetchUsername(token);
        this.cachedUsername = username;
        await this.globalState.update(STATE_KEY_USERNAME, username);

        this.notifyAuthStateChanged();
    }

    async clearAuthentication(): Promise<void> {
        this.cachedToken    = undefined;
        this.cachedUsername = undefined;

        try {
            await this.secrets.delete(SECRET_KEY_TOKEN);
            await this.globalState.update(STATE_KEY_USERNAME, undefined);
        } catch {
            // best-effort
        }

        this.notifyAuthStateChanged();
    }

    // ── Auth state listeners ──────────────────────────────────────────────────

    onAuthStateChanged(listener: AuthStateListener): vscode.Disposable {
        this.authListeners.push(listener);
        return new vscode.Disposable(() => {
            this.authListeners = this.authListeners.filter(l => l !== listener);
        });
    }

    private notifyAuthStateChanged(): void {
        for (const l of this.authListeners) {
            try { l(); } catch { /* best-effort */ }
        }
    }

    // ── Device Flow ───────────────────────────────────────────────────────────

    async requestDeviceCode(): Promise<DeviceCodeResponse> {
        const body = `client_id=${encodeURIComponent(CLIENT_ID)}&scope=${encodeURIComponent(SCOPE)}`;
        const json = await this.post(DEVICE_CODE_URL, body);

        if (typeof json !== 'object' || json === null) {
            throw new Error(t('auth_missing_device_code'));
        }
        const obj = json as Record<string, unknown>;

        const deviceCode      = obj['device_code'] as string | undefined;
        const userCode        = obj['user_code']   as string | undefined;
        const verificationUri = (obj['verification_uri'] as string | undefined) ?? 'https://github.com/login/device';
        const interval        = (obj['interval']   as number | undefined) ?? 5;
        const expiresIn       = (obj['expires_in'] as number | undefined) ?? 900;

        if (!deviceCode) { throw new Error(t('auth_missing_device_code')); }
        if (!userCode)   { throw new Error(t('auth_missing_user_code')); }

        return { deviceCode, userCode, verificationUri, interval, expiresIn };
    }

    async pollForToken(deviceCode: string): Promise<PollResult> {
        try {
            const body =
                `client_id=${encodeURIComponent(CLIENT_ID)}` +
                `&device_code=${encodeURIComponent(deviceCode)}` +
                `&grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:device_code')}`;

            const json = await this.post(ACCESS_TOKEN_URL, body) as Record<string, unknown>;

            const token = json['access_token'] as string | undefined;
            if (token) { return { kind: 'success', token }; }

            switch (json['error']) {
                case 'authorization_pending':
                case 'slow_down':
                    return { kind: 'pending' };
                case 'expired_token':
                    return { kind: 'expired' };
                default:
                    return { kind: 'error', message: (json['error_description'] as string | undefined) ?? t('auth_unknown_error') };
            }
        } catch (e: unknown) {
            return { kind: 'error', message: e instanceof Error ? e.message : t('general_network_error') };
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async fetchUsername(token: string): Promise<string | undefined> {
        return new Promise(resolve => {
            let res: import('http').IncomingMessage | undefined;
            const req = https.request(USER_API_URL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept:        'application/vnd.github+json',
                    'User-Agent':  `github-copilot-quota-monitor-vscode/${this.version}`,
                    'Connection':  'close',
                },
            }, incoming => {
                res = incoming;
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('error', () => resolve(undefined));
                res.on('end', () => {
                    try {
                        if (res!.statusCode === 200) {
                            resolve((JSON.parse(data) as Record<string, unknown>)['login'] as string | undefined);
                        } else {
                            resolve(undefined);
                        }
                    } catch {
                        resolve(undefined);
                    }
                });
            });
            req.on('error', () => resolve(undefined));
            req.setTimeout(10_000, () => { res?.destroy(); req.destroy(); resolve(undefined); });
            req.end();
        });
    }

    /** POST application/x-www-form-urlencoded and parse the JSON response. */
    private post(url: string, body: string): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path:     urlObj.pathname + urlObj.search,
                method:   'POST',
                headers:  {
                    'Content-Type':   'application/x-www-form-urlencoded',
                    'Accept':         'application/json',
                    'Content-Length': Buffer.byteLength(body),
                    'Connection':     'close',
                },
            };

            let res: import('http').IncomingMessage | undefined;
            const req = https.request(options, incoming => {
                res = incoming;
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('error', reject);
                res.on('end', () => {
                    const code = res!.statusCode ?? 0;
                    if (code < 200 || code >= 300) {
                        reject(new Error(tf('auth_device_code_http_error', code)));
                        return;
                    }
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(e); }
                });
            });

            req.on('error', reject);
            req.setTimeout(10_000, () => { res?.destroy(); req.destroy(); reject(new Error(t('general_network_error'))); });
            req.write(body);
            req.end();
        });
    }
}

