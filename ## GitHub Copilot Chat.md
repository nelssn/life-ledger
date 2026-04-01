## GitHub Copilot Chat

- Extension: 0.41.1 (prod)
- VS Code: 1.113.0 (cfbea10c5ffb233ea9177d34726e6056e89913dc)
- OS: win32 10.0.26200 x64
- GitHub Account: Signed Out

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.87.245.6 (866 ms)
- DNS ipv6 Lookup: Error (327 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (28 ms)
- Electron fetch (configured): HTTP 200 (549 ms)
- Node.js https: HTTP 200 (903 ms)
- Node.js fetch: HTTP 200 (628 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.112.21 (91 ms)
- DNS ipv6 Lookup: Error (69 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (3 ms)
- Electron fetch (configured): HTTP 200 (1316 ms)
- Node.js https: HTTP 200 (1722 ms)
- Node.js fetch: HTTP 200 (814 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 20.250.119.64 (401 ms)
- DNS ipv6 Lookup: Error (12 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (19 ms)
- Electron fetch (configured): HTTP 200 (591 ms)
- Node.js https: HTTP 200 (533 ms)
- Node.js fetch: HTTP 200 (475 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (321 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (925 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (959 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (886 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (587 ms)

Number of system certificates: 352

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).