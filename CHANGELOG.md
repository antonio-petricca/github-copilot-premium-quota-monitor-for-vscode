
# Changelog

## [1.0.5]

- Fixed HTTP connections not explicitly closed: added `Connection: close` header and `res.on('error')` handler to all HTTPS requests.
- Fixed missing `"types": ["node"]` in `tsconfig.json` that caused spurious TypeScript errors on Node.js built-in modules.
- Fixed potential response stream leak: `IncomingMessage` is now explicitly destroyed on request timeout.
- `User-Agent` header in `AuthService` and `PluginService` now reflects the real extension version read from `package.json` at runtime instead of the hardcoded `1.0`.

## [1.0.4]

- The widget unlimited quota string in all languages now shows only the infinity symbol (∞).

## [1.0.3]

- Fixed again the plugin icon.

## [1.0.2]

- Fixed plugin icon.

## [1.0.1]

- Change command base from "GitHub Copilot Quota" to "GitHub Copilot Premium Quota Monitor".
- Minor fixes in change log content.

## [1.0.0]

- Initial release coming based on the [IntelliJ plugin](https://github.com/antonio-petricca/github-copilot-premium-quota-monitor-for-ij).
