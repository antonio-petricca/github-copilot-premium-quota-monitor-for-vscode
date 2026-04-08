/**
 * StatusBarManager (mirrors StatusBarWidget.kt + StatusBarWidgetFactory.kt).
 *
 * Creates and manages the VS Code status bar item that shows the remaining
 * GitHub Copilot premium quota.
 *
 * - Single click  → quick-action menu (Refresh / Sign in or Sign out / Settings).
 * - Double click  → immediate quota refresh (no menu).
 * - Automatic background refresh at the configured interval.
 * - Color-coded urgency levels (critical / warning / normal).
 *
 * Double-click is detected by tracking the timestamp of the last click:
 * if two clicks arrive within DOUBLE_CLICK_MS the pending single-click timer
 * is cancelled and a refresh is triggered immediately instead.
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

/** Maximum interval (ms) between two clicks to be treated as a double-click. */
const DOUBLE_CLICK_MS = 400;
const STATUSBAR_ICON = '$(dashboard)';
const BLINK_STEP_MS = 400;
const BLINK_STEPS = 3;
const BLINK_DARK_GRAY = '#555555';

type MenuAction = 'refresh' | 'settings' | 'signIn' | 'signOut';
type ActionQuickPickItem = vscode.QuickPickItem & { action: MenuAction };

export class StatusBarManager {
    private readonly item: vscode.StatusBarItem;
    private refreshTimer: NodeJS.Timeout | undefined;
    private blinkTimer: NodeJS.Timeout | undefined;
    private singleClickTimer: NodeJS.Timeout | undefined;
    private lastClickAt = 0;
    private currentColor: vscode.ThemeColor | string | undefined;
    private disposables: vscode.Disposable[] = [];

    constructor(
        private readonly auth: AuthService,
        private readonly service: PluginService,
        private readonly context: vscode.ExtensionContext,
    ) {
        // Right-aligned with default VS Code status bar ordering.
        this.item = vscode.window.createStatusBarItem(
            'ghcpPremiumQuotaMonitor',
            vscode.StatusBarAlignment.Right,
        );
        this.item.name    = 'GitHub Copilot Premium Quota Monitor';
        this.item.command = 'ghcpPremiumQuotaMonitor.showMenu';
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

        // Register the hidden click command (triggered by clicking the item)
        this.disposables.push(
            vscode.commands.registerCommand('ghcpPremiumQuotaMonitor.showMenu', () => this.handleClick()),
        );

        // Register the public commands
        this.disposables.push(
            vscode.commands.registerCommand('ghcpPremiumQuotaMonitor.refresh', () => this.refresh()),
            vscode.commands.registerCommand('ghcpPremiumQuotaMonitor.signIn',  () => this.signIn()),
            vscode.commands.registerCommand('ghcpPremiumQuotaMonitor.signOut', () => this.signOut()),
        );

        // Initial render + first refresh
        this.updateItem(this.service.getCachedResult());
        this.refresh();
        this.startRefreshTimer();
    }

    dispose(): void {
        this.stopRefreshTimer();
        this.stopBlink();
        if (this.singleClickTimer) {
            clearTimeout(this.singleClickTimer);
            this.singleClickTimer = undefined;
        }
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
        let color: vscode.ThemeColor | string | undefined;

        switch (result.kind) {
            case 'loading':
                this.item.text    = `${STATUSBAR_ICON} ${t('statusbar_widget_initial')}`;
                this.item.tooltip = new vscode.MarkdownString(t('statusbar_tooltip_loading'));
                color = undefined;
                break;

            case 'available': {
                const pct = result.quota.percentRemaining;
                this.item.text    = `${STATUSBAR_ICON} ${tf('statusbar_widget_available', this.formatPercent(pct))}`;
                this.item.tooltip = this.buildTooltip(result);
                color = this.colorForPercent(pct);
                break;
            }

            case 'unlimited':
                this.item.text    = `${STATUSBAR_ICON} ${t('statusbar_widget_unlimited')}`;
                this.item.tooltip = new vscode.MarkdownString(t('statusbar_tooltip_unlimited'));
                color = undefined;
                break;

            case 'noAccount':
                this.item.text    = `${STATUSBAR_ICON} ${t('statusbar_widget_signin')}`;
                this.item.tooltip = new vscode.MarkdownString(t('statusbar_tooltip_noaccount'));
                color = undefined;
                break;

            case 'error':
                this.item.text    = `${STATUSBAR_ICON} ${t('statusbar_widget_error')}`;
                this.item.tooltip = new vscode.MarkdownString(tf('statusbar_tooltip_error', result.message));
                color = new vscode.ThemeColor('errorForeground');
                break;
        }

        this.currentColor = color;
        this.item.color = color;
    }

    private stopBlink(): void {
        if (this.blinkTimer) {
            clearInterval(this.blinkTimer);
            this.blinkTimer = undefined;
        }
    }

    /** Blink twice after refresh by alternating current color and dark gray. */
    private blinkItem(): void {
        this.stopBlink();

        const fullColor = this.currentColor;
        let step = 0;

        this.item.color = BLINK_DARK_GRAY;
        this.blinkTimer = setInterval(() => {
            step++;
            this.item.color = step % 2 === 1 ? fullColor : BLINK_DARK_GRAY;

            if (step >= BLINK_STEPS) {
                this.stopBlink();
                this.item.color = fullColor;
            }
        }, BLINK_STEP_MS);
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

    /**
     * Click handler for the status bar item.
     *
     * - Single click: defers the popup by DOUBLE_CLICK_MS so that the first
     *   click of a double-click sequence does NOT open the menu.
     * - Double click: cancels the pending single-click timer and refreshes
     *   the quota immediately (mirrors IntelliJ StatusBarWidget.kt).
     */
    private handleClick(): void {
        const now = Date.now();
        if (now - this.lastClickAt <= DOUBLE_CLICK_MS) {
            // Double-click detected: cancel pending menu and refresh immediately.
            if (this.singleClickTimer) {
                clearTimeout(this.singleClickTimer);
                this.singleClickTimer = undefined;
            }
            this.lastClickAt = 0;
            this.refresh();
        } else {
            // First click: schedule menu after the double-click window expires.
            this.lastClickAt = now;
            if (this.singleClickTimer) { clearTimeout(this.singleClickTimer); }
            this.singleClickTimer = setTimeout(() => {
                this.singleClickTimer = undefined;
                this.showMenu();
            }, DOUBLE_CLICK_MS);
        }
    }

    private async showMenu(): Promise<void> {
        const isSignedIn = this.auth.isAuthenticatedCached();
        const items: Array<ActionQuickPickItem | vscode.QuickPickItem> = [
            { label: '$(refresh) ' + t('statusbar_action_refresh'), action: 'refresh' },
            { label: '$(gear) ' + t('statusbar_action_settings'), action: 'settings' },
            { kind: vscode.QuickPickItemKind.Separator, label: '' },
            isSignedIn
                ? { label: '$(sign-out) ' + t('statusbar_action_signout'), action: 'signOut' }
                : { label: '$(person)   ' + t('statusbar_action_signin'), action: 'signIn' },
        ];

        const chosen = await vscode.window.showQuickPick(items, {
            placeHolder: 'GitHub Copilot Premium Quota Monitor',
        });
        if (!chosen || !('action' in chosen)) { return; }

        switch (chosen.action) {
            case 'refresh':
                this.refresh();
                break;
            case 'settings':
                vscode.commands.executeCommand('workbench.action.openSettings', 'ghcpPremiumQuotaMonitor');
                break;
            case 'signIn':
                this.signIn();
                break;
            case 'signOut':
                this.signOut();
                break;
        }
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    private refresh(): void {
        this.service.refreshQuota()
            .then(() => this.blinkItem())
            .catch(() => { /* best-effort */ });
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

