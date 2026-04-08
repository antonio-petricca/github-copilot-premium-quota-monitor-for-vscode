/**
 * DeviceAuthWebview (mirrors DeviceAuthFlowDialog.kt).
 *
 * Opens a VS Code Webview panel that guides the user through the GitHub
 * OAuth 2.0 Device Authorization Grant.  It polls for the access token
 * in the background and closes automatically on success.
 */

import * as vscode from 'vscode';
import { AuthService, DeviceCodeResponse } from './authService';
import { t, tf } from './i18n';

export class DeviceAuthWebview {
    private panel: vscode.WebviewPanel | undefined;
    private pollingTimer: NodeJS.Timeout | undefined;
    private countdownTimer: NodeJS.Timeout | undefined;
    private secondsRemaining: number;
    private auth: AuthService;
    private response: DeviceCodeResponse;
    private onDone: (authenticated: boolean) => void;

    constructor(
        auth: AuthService,
        response: DeviceCodeResponse,
        onDone: (authenticated: boolean) => void,
    ) {
        this.auth             = auth;
        this.response         = response;
        this.onDone           = onDone;
        this.secondsRemaining = response.expiresIn;
    }

    show(): void {
        this.panel = vscode.window.createWebviewPanel(
            'ghcpDeviceAuth',
            t('deviceauth_dialog_title'),
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: false },
        );

        this.panel.webview.html = this.buildHtml();

        // Messages from the webview → extension
        this.panel.webview.onDidReceiveMessage(msg => {
            switch ((msg as { command: string }).command) {
                case 'copyCode':
                    vscode.env.clipboard.writeText(this.response.userCode);
                    this.panel?.webview.postMessage({ command: 'copyFeedback' });
                    break;
                case 'openBrowser':
                    vscode.env.openExternal(vscode.Uri.parse(this.response.verificationUri));
                    break;
                case 'cancel':
                    this.dispose(false);
                    break;
            }
        });

        this.panel.onDidDispose(() => this.dispose(false));

        this.startPolling();
        this.startCountdown();
    }

    // ── Polling ───────────────────────────────────────────────────────────────

    private startPolling(): void {
        const intervalMs = Math.max(this.response.interval, 5) * 1_000;
        const expiresAt  = Date.now() + this.response.expiresIn * 1_000;

        const poll = async () => {
            if (Date.now() >= expiresAt) {
                this.updateStatus(t('deviceauth_code_expired'), true);
                this.stopTimers();
                return;
            }

            try {
                const result = await this.auth.pollForToken(this.response.deviceCode);
                switch (result.kind) {
                    case 'success':
                        await this.auth.saveAuthentication(result.token);
                        this.stopTimers();
                        this.panel?.dispose();
                        this.onDone(true);
                        return;
                    case 'pending':
                        break;
                    case 'expired':
                        this.updateStatus(t('deviceauth_code_expired'), true);
                        this.stopTimers();
                        return;
                    case 'error':
                        this.updateStatus(tf('deviceauth_error_with_message', result.message), true);
                        this.stopTimers();
                        return;
                }
            } catch (e: unknown) {
                this.updateStatus(tf('deviceauth_network_error_prefix', e instanceof Error ? e.message : String(e)), true);
                this.stopTimers();
                return;
            }

            this.pollingTimer = setTimeout(poll, intervalMs);
        };

        this.pollingTimer = setTimeout(poll, intervalMs);
    }

    private startCountdown(): void {
        this.countdownTimer = setInterval(() => {
            this.secondsRemaining = Math.max(this.secondsRemaining - 1, 0);
            const m = Math.floor(this.secondsRemaining / 60);
            const s = String(this.secondsRemaining % 60).padStart(2, '0');
            this.panel?.webview.postMessage({ command: 'countdown', value: `${m}:${s}` });
        }, 1_000);
    }

    private stopTimers(): void {
        if (this.pollingTimer)   { clearTimeout(this.pollingTimer);  this.pollingTimer   = undefined; }
        if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = undefined; }
    }

    private updateStatus(text: string, isError: boolean): void {
        this.panel?.webview.postMessage({ command: 'status', text, isError });
    }

    private dispose(authenticated: boolean): void {
        this.stopTimers();
        if (this.panel) {
            const p = this.panel;
            this.panel = undefined;
            p.dispose();
        }
        this.onDone(authenticated);
    }

    // ── HTML ──────────────────────────────────────────────────────────────────

    private buildHtml(): string {
        const { userCode, verificationUri } = this.response;
        const m = Math.floor(this.secondsRemaining / 60);
        const s = String(this.secondsRemaining % 60).padStart(2, '0');
        const initialCountdown = `${m}:${s}`;

        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${t('deviceauth_dialog_title')}</title>
<style>
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 24px;
    max-width: 560px;
    margin: 0 auto;
  }
  h2 { margin: 0 0 4px; font-size: 15px; }
  .subtitle { color: var(--vscode-descriptionForeground); font-size: 12px; margin-bottom: 20px; }
  hr { border: none; border-top: 1px solid var(--vscode-widget-border, #555); margin-bottom: 20px; }
  .step-heading { font-size: 12px; margin-bottom: 8px; }
  .step-heading b { font-weight: 600; }
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, #555);
    border-radius: 4px;
    padding: 10px 16px;
    margin-bottom: 16px;
    min-height: 48px;
  }
  .code {
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 2px;
  }
  .url { font-size: 12px; word-break: break-all; }
  button {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 5px 12px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
    margin-left: 12px;
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    margin-top: 6px;
  }
  .status-row.error { color: var(--vscode-errorForeground); }
  .actions { margin-top: 24px; display: flex; gap: 8px; justify-content: flex-end; }
  .btn-secondary {
    background: var(--vscode-button-secondaryBackground, transparent);
    color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
    border: 1px solid var(--vscode-button-border, #555);
  }
</style>
</head>
<body>
<h2>${t('deviceauth_dialog_header')}</h2>
<p class="subtitle">${t('deviceauth_dialog_subtitle')}</p>
<hr/>

<p class="step-heading"><b>1.</b>&nbsp; ${t('deviceauth_step2')}</p>
<div class="card">
  <span class="code" id="userCode">${userCode}</span>
  <button id="btnCopy">${t('deviceauth_copy')}</button>
</div>

<p class="step-heading"><b>2.</b>&nbsp; ${t('deviceauth_step1')}</p>
<div class="card">
  <span class="url">${verificationUri}</span>
  <button id="btnOpen">${t('deviceauth_open_url')}</button>
</div>

<div class="status-row" id="statusRow">
  <span id="statusText">${t('deviceauth_waiting_auth')}</span>
  <span id="countdown">${initialCountdown}</span>
</div>

<div class="actions">
  <button class="btn-secondary" id="btnCancel">${t('deviceauth_button_cancel')}</button>
</div>

<script>
  const vscode = acquireVsCodeApi();

  document.getElementById('btnCopy').addEventListener('click', () => {
    vscode.postMessage({ command: 'copyCode' });
  });
  document.getElementById('btnOpen').addEventListener('click', () => {
    vscode.postMessage({ command: 'openBrowser' });
  });
  document.getElementById('btnCancel').addEventListener('click', () => {
    vscode.postMessage({ command: 'cancel' });
  });

  let copyResetTimer;
  window.addEventListener('message', e => {
    const msg = e.data;
    switch (msg.command) {
      case 'copyFeedback':
        const btn = document.getElementById('btnCopy');
        btn.textContent = '${t('deviceauth_copy_done')}';
        clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(() => { btn.textContent = '${t('deviceauth_copy')}'; }, 2000);
        break;
      case 'countdown':
        document.getElementById('countdown').textContent = msg.value;
        break;
      case 'status':
        const row = document.getElementById('statusRow');
        document.getElementById('statusText').textContent = msg.text;
        document.getElementById('countdown').textContent  = '';
        row.className = 'status-row' + (msg.isError ? ' error' : '');
        break;
    }
  });
</script>
</body>
</html>`;
    }
}

