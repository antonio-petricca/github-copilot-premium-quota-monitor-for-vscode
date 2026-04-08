/**
 * Settings wrapper (mirrors PluginSettings.kt).
 *
 * Reads/writes from the VS Code configuration namespace `ghcpQuotaMonitor.*`.
 */

import * as vscode from 'vscode';

const SECTION = 'ghcpQuotaMonitor';

export const DEFAULT_REFRESH_INTERVAL_MINUTES = 5;
export const DEFAULT_CRITICAL_THRESHOLD = 10;
export const DEFAULT_WARNING_THRESHOLD = 30;
export const DEFAULT_CRITICAL_COLOR = '#FF0000';
export const DEFAULT_WARNING_COLOR = '#FFFF00';

export const MIN_INTERVAL_MINUTES = 1;
export const MAX_INTERVAL_MINUTES = 60;
export const MIN_THRESHOLD = 2;
export const MAX_THRESHOLD = 99;

function cfg(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(SECTION);
}

export function getRefreshIntervalMinutes(): number {
    const v = cfg().get<number>('refreshIntervalMinutes', DEFAULT_REFRESH_INTERVAL_MINUTES);
    return Math.min(Math.max(v, MIN_INTERVAL_MINUTES), MAX_INTERVAL_MINUTES);
}

export function getCriticalThreshold(): number {
    return cfg().get<number>('criticalThreshold', DEFAULT_CRITICAL_THRESHOLD);
}

export function getCriticalColor(): string {
    return cfg().get<string>('criticalColor', DEFAULT_CRITICAL_COLOR);
}

export function getWarningThreshold(): number {
    return cfg().get<number>('warningThreshold', DEFAULT_WARNING_THRESHOLD);
}

export function getWarningColor(): string {
    return cfg().get<string>('warningColor', DEFAULT_WARNING_COLOR);
}

/**
 * Registers a listener that fires whenever any `ghcpQuotaMonitor.*` setting
 * changes and returns a Disposable to unregister it.
 */
export function onSettingsChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(SECTION)) {
            callback();
        }
    });
}

