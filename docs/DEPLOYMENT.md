# Standalone Cloudflare Tunnel Deployment

This repository includes a self-contained deployment path that has **no Manus runtime or service dependency**. It builds the Vite application, starts a localhost-only static server, creates a remotely managed Cloudflare Tunnel, configures a published hostname, and creates the associated proxied DNS CNAME record.

> The deployment script creates and manages an HTTPS route for this dashboard. It does **not** create payloads, run exploits, operate C2 infrastructure, or install unreviewed plugins.

## Deployment approaches

| Approach | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- | --- |
| **Cloudflare Tunnel script** | Keeps the service on a Linux host and publishes only a localhost-bound application through Cloudflare. Requires Cloudflare account access, an API token, and `sudo` for persistent services. | Cloudflare plan and host costs apply. | Moderate; automated by `scripts/deploy-cloudflare.sh`. |
| **Managed static hosting** | Easier operationally, but does not provide a locally controlled tunnel agent or local system-service workflow. | Provider-dependent. | Low. |

The requested script implements the first option. Cloudflare documents that a production tunnel needs a Cloudflare account, a Cloudflare-managed domain, a host running `cloudflared`, an account permission to edit Tunnels, and zone permission to edit DNS.[1]

## Prerequisites

The script is designed for Debian or Ubuntu with `bash`, `curl`, `node`, `pnpm`, `sudo`, and outbound internet access. It automatically installs `cloudflared` through Cloudflare's Debian/Ubuntu package repository when needed. Ensure the host can reach Cloudflare; Cloudflare notes that restrictive firewalls may need outbound connectivity on port `7844`.[1]

Create a narrowly scoped Cloudflare API token with the following permissions:

| Scope | Permission | Why it is needed |
| --- | --- | --- |
| Account | Cloudflare Tunnel / Cloudflare One connector **Edit** | Create the remotely managed tunnel and set ingress configuration. |
| Zone | DNS **Edit** | Create the proxied CNAME record for the selected hostname. |

The deploy prompt also requests an optional account email because legacy Cloudflare authentication flows use one. The script does not transmit the email and uses the API token exclusively.

## Run it

Clone the repository to the intended Linux host, then run:

```bash
pnpm install --frozen-lockfile
pnpm run deploy:cloudflare
```

The script prompts locally for the account ID, zone ID, base domain (default: `cloutscape.org`), hostname label (default: `ops`), tunnel mode, tunnel name, optional metadata email, and API token. The default **create** mode provisions a new remote-managed tunnel and retrieves its service token automatically. The **existing** mode additionally prompts for a Cloudflared tunnel token and tunnel ID, allowing an existing tunnel to be republished with the selected route. All token input is hidden and no token is written to the repository. For an initial non-mutating check, run:

```bash
bash scripts/deploy-cloudflare.sh --dry-run
```

The normal workflow builds the application, validates the safe plugin registry, creates a remote-managed tunnel, maps the selected hostname to `http://127.0.0.1:8080`, and creates a proxied CNAME pointing at `<tunnel-id>.cfargotunnel.com`. Cloudflare specifies that tunnel ingress configuration needs a catch-all rule and that a DNS CNAME route is created under the zone DNS endpoint.[1]

The script then installs two system services. `red-team-ops-coordinator.service` serves `dist/` on `127.0.0.1:8080`; `cloudflared.service` forwards the Cloudflare route to that local server. It will not overwrite an existing `cloudflared` service unless the operator explicitly types `REPLACE`.

## Operations and rollback

Use these commands after deployment:

```bash
sudo systemctl status red-team-ops-coordinator
sudo systemctl status cloudflared
sudo journalctl -u red-team-ops-coordinator -f
sudo journalctl -u cloudflared -f
```

To stop publication, disable the local service and remove the published route or DNS record in Cloudflare:

```bash
sudo systemctl disable --now red-team-ops-coordinator
sudo systemctl disable --now cloudflared
```

The script stores only non-secret deployment metadata, such as the generated tunnel ID and hostname, in `.deploy/last-deploy.json`. The directory is ignored by Git. Rotate a Cloudflare token immediately if it is accidentally exposed, and replace the `cloudflared` service token through the Cloudflare dashboard before bringing the service back online.

## Safe plugin hub

`config/plugin-hub.json` is a declarative registry for read-only public-source context. It intentionally allows only reviewed HTTPS endpoints, requires authorization for any use, and never installs code or invokes system commands. Validate it with:

```bash
pnpm run plugins:validate
```

`config/simulation-templates.json` provides consent-based exercise templates with written approval gates, evidence goals, and stop criteria. It replaces payload generation or exploit delivery with auditable defensive validation planning.

## References

[1]: https://developers.cloudflare.com/tunnel/setup/ "Cloudflare Tunnel setup documentation"
