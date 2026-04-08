/**
 * Extension entry point (activate / deactivate).
 *
 * Wires together AuthService → PluginService → StatusBarManager and
 * triggers an initial sign-in prompt if the user is not yet authenticated.
 */

import * as vscode from 'vscode';
import { AuthService } from './authService';
import { PluginService } from './pluginService';
import { StatusBarManager } from './statusBarManager';
import { DeviceAuthWebview } from './deviceAuthWebview';
import { t, tf } from './i18n';

let statusBarManager: StatusBarManager | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const auth    = new AuthService(context);
    const service = new PluginService(auth);
    statusBarManager = new StatusBarManager(auth, service, context);

    context.subscriptions.push(new vscode.Disposable(() => statusBarManager?.dispose()));

    // If not authenticated on startup, offer to sign in (non-blocking).
    try {
        const authenticated = await auth.isAuthenticated();
        if (!authenticated) {
            const answer = await vscode.window.showInformationMessage(
                t('general_not_signed_in'),
                t('statusbar_action_signin'),
            );
            if (answer === t('statusbar_action_signin')) {
                const response = await auth.requestDeviceCode();
                new DeviceAuthWebview(auth, response, () => { /* refresh fired by auth state change */ }).show();
            }
        }
    } catch (e: unknown) {
        vscode.window.showErrorMessage(
            tf('statusbar_dialog_auth_error_msg', e instanceof Error ? e.message : String(e)),
        );
    }
}

export function deactivate(): void {
    statusBarManager?.dispose();
    statusBarManager = undefined;
}

