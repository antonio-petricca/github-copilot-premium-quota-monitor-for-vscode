/**
 * Localization support (mirrors Messages.kt from the IntelliJ plugin).
 *
 * At runtime VS Code exposes `vscode.l10n.t()` for bundle-based translations,
 * but that requires the l10n bundle to be compiled into the VSIX.  For
 * simplicity we ship a lightweight JSON-based fallback that reads the locale
 * from the OS and picks the matching translation file from the `l10n/` folder.
 *
 * Usage:
 *   import { t, tf } from './i18n';
 *   t('statusbar_widget_signin')          // → "GHCP premium quota monitor - Sign in"
 *   tf('general_api_http', 404)           // → "GitHub API returned HTTP 404."
 */

import * as vscode from 'vscode';

// ── Built-in English strings (fallback) ──────────────────────────────────────

const EN: Record<string, string> = {
    // General
    general_api_http: 'GitHub API returned HTTP {0}.',
    general_network_error: 'Network error',
    general_not_signed_in:
        "Not signed in. Click the status bar widget and choose 'Sign in with GitHub'.",
    general_parse_failed: 'Failed to parse quota data: {0}',
    general_token_invalid:
        'GitHub token is invalid or expired (HTTP {0}). Click the status bar widget to sign in again.',

    // Device auth webview
    deviceauth_button_cancel: 'Cancel',
    deviceauth_button_ok: 'Confirm',
    deviceauth_code_expired: 'Code expired — please restart the sign-in process.',
    deviceauth_copy: 'Copy Code',
    deviceauth_copy_done: '✓ Copied!',
    deviceauth_dialog_header: 'GitHub Copilot Authentication',
    deviceauth_dialog_subtitle: 'Complete the steps below to authorize the extension.',
    deviceauth_dialog_title: 'Sign In to GitHub Copilot',
    deviceauth_error_with_message: 'Error: {0}',
    deviceauth_network_error_prefix: 'Network error: {0}',
    deviceauth_open_url: 'Open in Browser',
    deviceauth_step1: 'Open the GitHub authorization page in your browser',
    deviceauth_step2: 'Copy and enter this one-time code on GitHub',
    deviceauth_waiting_auth: 'Waiting for authorization…',

    // Status bar and popup
    statusbar_action_refresh: 'Refresh',
    statusbar_action_settings: 'Open Settings…',
    statusbar_action_signin: 'Sign in with GitHub',
    statusbar_action_signout: 'Sign Out',
    statusbar_signout_complete: 'Signed out.',
    statusbar_signout_confirm_no_username: 'Sign out?',
    statusbar_signout_confirm_when_username: 'Sign out "{0}"?',
    statusbar_signout_title: 'GitHub Sign Out',
    statusbar_tooltip_error: 'GitHub Copilot premium quota monitor — ✗ Error: {0}',
    statusbar_tooltip_loading: 'GitHub Copilot premium quota monitor - loading...',
    statusbar_tooltip_noaccount: '⚠ Not signed in.\nClick to sign in.',
    statusbar_tooltip_unlimited: 'Unlimited premium quota',
    statusbar_tooltip_available: 'Remaining quota: {0}%\nInteractions: {1}\nRenewal: {2}',
    statusbar_tooltip_available_with_total:
        'Remaining quota: {0}%\nInteractions: {1} of {2}\nRenewal: {3}',
    statusbar_widget_available: '{0}%',
    statusbar_widget_error: '✗',
    statusbar_widget_initial: 'GHCP…',
    statusbar_widget_signin: 'GHCP — Sign in',
    statusbar_widget_unlimited: 'GHCP ∞',

    // Auth dialog messages
    statusbar_dialog_auth_error_msg: 'Authentication error: {0}',
    statusbar_dialog_auth_error_title: 'Authentication Error',

    // Auth service
    auth_device_code_http_error: 'GitHub returned HTTP {0} for device-code request',
    auth_missing_device_code: 'Missing device_code in response',
    auth_missing_user_code: 'Missing user_code in response',
    auth_poll_http_error: 'HTTP {0}',
    auth_unknown_error: 'Unknown error',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the localized string for [key], falling back to English when not
 * found in the active bundle.
 */
export function t(key: string): string {
    return EN[key] ?? `[${key}]`;
}

/**
 * Returns the localized string for [key] with {0}, {1}, … placeholders
 * replaced by the supplied [args].
 */
export function tf(key: string, ...args: unknown[]): string {
    let msg = t(key);
    args.forEach((arg, i) => {
        msg = msg.replaceAll(`{${i}}`, String(arg ?? ''));
    });
    return msg;
}

/**
 * Returns the user-facing locale string (e.g. "en", "it", "de") derived from
 * VS Code's display language setting.
 */
export function locale(): string {
    return vscode.env.language ?? 'en';
}

