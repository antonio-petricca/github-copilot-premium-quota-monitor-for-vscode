# GitHub Copilot Premium Quota Monitor — VS Code Extension

Monitor the remaining GitHub Copilot premium model quota directly from the VS Code status bar.

## Features

- **Status bar widget** showing the remaining premium quota as a percentage (with Copilot icon) and colour-coded urgency levels (critical / warning / normal).
- **Single click** the widget to open a quick-action menu: Refresh, Sign in, Sign out, Open Settings.
- **Double click** the widget to refresh the quota immediately.
- **Configurable alert thresholds and colours**: set your own *critical* (default 10 %) and *warning* (default 30 %) percentage thresholds and colours via `Settings → Extensions → GitHub Copilot Premium Quota Monitor`.
- **Automatic background refresh** (default every 5 minutes, configurable 1–60 min).
- **Secure authentication** via GitHub OAuth Device Flow; token stored in VS Code's Secret Storage (OS keychain).
- **Tooltip** with remaining quota %, interactions, and renewal date.
- **Multilingual**: English, German, Spanish, French, Italian, Japanese, Portuguese, Russian, Albanian, Turkish, Chinese (Simplified).

## Requirements

A GitHub account with an active Copilot subscription is required.

## Getting Started

1. Install the extension.
2. On first launch you will be prompted to sign in — click **Sign in with GitHub**.
3. A panel opens with a one-time code. Copy it, open the GitHub authorisation page, paste the code, and approve.
4. The status bar widget will start showing your quota.

## Settings

| Setting | Default | Description |
|---|---|---|
| `ghcpPremiumQuotaMonitor.refreshIntervalMinutes` | `5` | Auto-refresh interval (1–60 min) |
| `ghcpPremiumQuotaMonitor.criticalThreshold` | `10` | Quota % for critical colour |
| `ghcpPremiumQuotaMonitor.criticalColor` | `#FF0000` | Colour for critical state |
| `ghcpPremiumQuotaMonitor.warningThreshold` | `30` | Quota % for warning colour |
| `ghcpPremiumQuotaMonitor.warningColor` | `#FFFF00` | Colour for warning state |

## Commands

| Command | Description |
|---|---|
| `GitHub Copilot Quota: Refresh Quota` | Refresh quota immediately |
| `GitHub Copilot Quota: Sign In with GitHub` | Start the sign-in flow |
| `GitHub Copilot Quota: Sign Out` | Sign out and clear credentials |

## Credits

Based on the [IntelliJ plugin](https://github.com/antonio-petricca/github-copilot-premium-quota-monitor-for-ij).

Special thanks to contributors:

- [Fabio Miconi](https://github.com/miconif)
- [Fabio Pelliccia](https://github.com/Fabio-Pelliccia)-
- [Massimo Ambrosino](https://github.com/mambrosino)
- [Vincenzo Pimpinella](https://github.com/Enzo88).

## License

MIT

