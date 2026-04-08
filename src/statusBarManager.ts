/**
 * StatusBarManager (mirrors StatusBarWidget.kt + StatusBarWidgetFactory.kt).
 *
 * Creates and manages the VS Code status bar item that shows the remaining
 * GitHub Copilot premium quota.
 *
 * - Click on the item → quick-action menu (Refresh / Sign in or Sign out / Settings).
 * - Automatic background refresh at the configured interval.
 * - Color-coded urgency levels (critical / warning / normal).
 */

import * as vscode from 'vscode';
import { AuthService } from './authService';
import { PluginService, QuotaResult } from './pluginService';
import { DeviceAuthWebview } from './deviceAuthWebview';
import {
    getCriticalColor,
    getCriticalThreshold,
    getRefreshIntervalMinutes,
    getWarningColor,
    getWarningThreshold,
    onSettingsChanged,
} from './settings';
import { t, tf } from './i18n';

export class StatusBarManager {
    private item: vscode.StatusBarItem;
    private refreshTimer: NodeJS.Timeout | undefined;
    private disposables: vscode.Disposable[] = [];

    constructor(
        private readonly auth: AuthService,
        private readonly service: PluginService,
        private readonly context: vscode.ExtensionContext,
    ) {
        // Right-aligned next to Copilot's own status indicator.
        this.item = vscode.window.createStatusBarItem(
            'ghcpQuotaMonitor',
            vscode.StatusBarAlignment.Right,
            100,
        );
        this.item.name    = 'GitHub Copilot Premium Quota Monitor';
        this.item.command = 'ghcpQuotaMonitor.showMenu';
        this.item.show();

        // Subscribe to quota updates
        const unsubQuota = this.service.onQuotaUpdated(result => {
            this.updateItem(result);
        });
        this.disposables.push(new vscode.Disposable(unsubQuota));

        // Subscribe to settings changes
        this.disposables.push(onSettingsChanged(() => {
            this.restartRefreshTimer();
            this.updateItem(this.service.getCachedResult());
        }));

        // Register the hidden "show menu" command (triggered by clicking the item)
        this.disposables.push(
            vscode.commands.registerCommand('ghcpQuotaMonitor.showMenu', () => this.showMenu()),
        );

        // Register the public commands
        this.disposables.push(
            vscode.commands.registerCommand('ghcpQuotaMonitor.refresh', () => this.refresh()),
            vscode.commands.registerCommand('ghcpQuotaMonitor.signIn',  () => this.signIn()),
            vscode.commands.registerCommand('ghcpQuotaMonitor.signOut', () => this.signOut()),
        );

        // Initial render + first refresh
        this.updateItem(this.service.getCachedResult());
        this.refresh();
        this.startRefreshTimer();
    }

    dispose(): void {
        this.stopRefreshTimer();
        this.item.dispose();
        for (const d of this.disposables) { d.dispose(); }
        this.disposables = [];
    }

    // ── Refresh timer ─────────────────────────────────────────────────────────

    private startRefreshTimer(): void {
        const intervalMs = getRefreshIntervalMinutes() * 60 * 1_000;
        this.refreshTimer = setInterval(() => this.refresh(), intervalMs);
    }

    private stopRefreshTimer(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
        }
    }

    private restartRefreshTimer(): void {
        this.stopRefreshTimer();
        this.startRefreshTimer();
    }

    // ── Status bar item update ────────────────────────────────────────────────

    private updateItem(result: QuotaResult): void {
        switch (result.kind) {
            case 'loading':
                this.item.text    = t('statusbar_widget_initial');
                this.item.tooltip = t('statusbar_tooltip_loading');
                this.item.color   = undefined;
                break;

            case 'available': {
                const pct = result.quota.percentRemaining;
                this.item.text    = tf('statusbar_widget_available', this.formatPercent(pct));
                this.item.tooltip = this.buildTooltip(result);
                this.item.color   = this.colorForPercent(pct);
                break;
            }

            case 'unlimited':
                this.item.text    = t('statusbar_widget_unlimited');
                this.item.tooltip = t('statusbar_tooltip_unlimited');
                this.item.color   = undefined;
                break;

            case 'noAccount':
                this.item.text    = t('statusbar_widget_signin');
                this.item.tooltip = t('statusbar_tooltip_noaccount');
                this.item.color   = undefined;
                break;

            case 'error':
                this.item.text    = t('statusbar_widget_error');
                this.item.tooltip = tf('statusbar_tooltip_error', result.message);
                this.item.color   = new vscode.ThemeColor('errorForeground');
                break;
        }
    }

    private buildTooltip(result: Extract<QuotaResult, { kind: 'available' }>): vscode.MarkdownString {
        const pctStr    = this.formatPercent(result.quota.percentRemaining);
        const renewal   = result.quota.renewalDate ? this.formatTimestamp(result.quota.renewalDate) : '—';
        const remaining = result.quota.quotaRemaining !== undefined
            ? String(Math.round(result.quota.quotaRemaining))
            : '—';

        let md: string;
        if (result.quota.quotaTotal !== undefined) {
            const total = String(Math.round(result.quota.quotaTotal));
            md = tf('statusbar_tooltip_available_with_total', pctStr, remaining, total, renewal);
        } else {
            md = tf('statusbar_tooltip_available', pctStr, remaining, renewal);
        }

        const tooltip = new vscode.MarkdownString(md);
        tooltip.isTrusted = true;
        return tooltip;
    }

    private colorForPercent(pct: number): vscode.ThemeColor | string | undefined {
        if (pct <= getCriticalThreshold()) { return getCriticalColor(); }
        if (pct <= getWarningThreshold())  { return getWarningColor(); }
        return undefined; // default foreground
    }

    // ── Quick-action menu ─────────────────────────────────────────────────────

    private async showMenu(): Promise<void> {
        const isSignedIn = this.auth.isAuthenticatedCached();
        const items: vscode.QuickPickItem[] = [
            { label: '$(refresh) ' + t('statusbar_action_refresh') },
            { label: '$(gear) '    + t('statusbar_action_settings') },
            { kind: vscode.QuickPickItemKind.Separator, label: '' },
            isSignedIn
                ? { label: '$(sign-out) ' + t('statusbar_action_signout') }
                : { label: '$(person)   ' + t('statusbar_action_signin') },
        ];

        const chosen = await vscode.window.showQuickPick(items, {
            placeHolder: 'GitHub Copilot Premium Quota Monitor',
        });
        if (!chosen) { return; }

        if (chosen.label.includes(t('statusbar_action_refresh'))) {
            this.refresh();
        } else if (chosen.label.includes(t('statusbar_action_settings'))) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'ghcpQuotaMonitor');
        } else if (chosen.label.includes(t('statusbar_action_signin'))) {
            this.signIn();
        } else if (chosen.label.includes(t('statusbar_action_signout'))) {
            this.signOut();
        }
    }

    // ── Actions ───────────────────────────────────��───────────────────────────

    private refresh(): void {
        this.service.refreshQuota().catch(() => { /* best-effort */ });
    }

    private signIn(): void {
        this.auth.requestDeviceCode().then(response => {
            new DeviceAuthWebview(this.auth, response, authenticated => {
                if (authenticated) { this.refresh(); }
            }).show();
        }).catch((e: unknown) => {
            vscode.window.showErrorMessage(
                tf('statusbar_dialog_auth_error_msg', e instanceof Error ? e.message : String(e)),
            );
        });
    }

    private async signOut(): Promise<void> {
        const username = this.auth.getSavedUsername();
        const msg = username
            ? tf('statusbar_signout_confirm_when_username', username)
            : t('statusbar_signout_confirm_no_username');

        const answer = await vscode.window.showWarningMessage(
            msg,
            { modal: true },
            t('statusbar_action_signout'),
        );

        if (answer === t('statusbar_action_signout')) {
            await this.auth.clearAuthentication();
            vscode.window.showInformationMessage(t('statusbar_signout_complete'));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Formats a percentage: integer → no decimals; non-integer → one decimal. */
    private formatPercent(value: number): string {
        const rounded = Math.round(value * 10) / 10;
        return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    }

    /** Formats an ISO-8601 timestamp using the VS Code UI locale. */
    private formatTimestamp(ts: string): string {
        try {
            const locale = vscode.env.language || 'en';
            const d = new Date(ts);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
            }
            return ts;
        } catch {
            return ts;
        }
    }
}

