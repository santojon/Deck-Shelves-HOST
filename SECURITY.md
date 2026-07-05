# Security Policy

## Scope

`@deck-shelves/host` ships **type definitions only** (the `HostApi` contract).
It contains no runtime code, performs no I/O, and stores no data; the sensitive
surfaces (the injected runtime, RPC, settings persistence) live in the Shelves
Loader and the plugin backend.

## Reporting a vulnerability

Please report privately — do **not** open a public issue for security matters.
Use GitHub's private "Report a vulnerability" advisory on the repository, or
contact the maintainer listed in the repository profile.

We aim to acknowledge reports within a few days and to ship a fix or mitigation
as fast as the severity warrants.
