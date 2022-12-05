# Tool Setup Action

Generic action for cached installation of any tool that offers pre-compiled
binaries for download.

## Motivation

[`@actions/tool-cache`][tc] exists to help download pre-compiled binaries and
cache them. However, its ergonomics are such that distinct actions for specific
tools are necessary to wrap it into something useful. For the most part, the
wrapping is required to manage variation in the release URLs such as the
position and names used for things like "os" or "architecture".

[tc]: https://github.com/actions/toolkit/tree/main/packages/tool-cache

This doesn't scale. Instead, this action abstracts over that and offers good
ergonomics for users to specify any variation directly via `inputs`. This should
allow the action to be used easily for *any* such case, and obviate any
tool-specific actions or support cases for which a tool-specific action doesn't
exist, without having to create one.

See _Examples_ for more details.

## Usage

```yaml
steps:
  - uses: pbrisbin/setup-tool-action@v1
    with:
      name: my-tool
      version: 1.0.0
      url: 'http://releases.my-tool.com/{name}-{version}.{os}-{arch}.{ext}'
```

## Inputs

TODO: document this.

See [`action.yml`](./action.yml) for a up to date and comprehensive details.

## Outputs

None.

See [`action.yml`](./action.yml) for a up to date and comprehensive details.

## Examples

### HLint

```yaml
with:
  name: 'hlint'
  version: '3.5'
  url: 'https://github.com/ndmitchell/{name}/releases/download/v{version}/{name}-{version}-{arch}-{os}.{ext}'
  subdir: '{name}-{version}'
  os-darwin: osx
  os-win32: windows
  arch-x64: x86_64
```

**Replaces**: https://github.com/haskell/actions/tree/main/hlint-setup

### Dead Man's Snitch Field Agent

```yaml
with:
  name: dms
  version: latest
  url: "https://releases.deadmanssnitch.com/field-agent/{version}/{name}_{os}_{arch}.{ext}"
  os-darwin: macos
  os-win32: windows
  arch-x64: amd64
```

**Replaces**: N/A

### Pandoc

```yaml
with:
  name: pandoc
  version: 2.19.2
  url: 'https://github.com/jgm/{name}/releases/download/{version}/{name}-{version}-{os}-{arch}.{ext}'
  url-darwin: 'https://github.com/jgm/{name}/releases/download/{version}/{name}-{version}-macOS.zip'
  os-win32: windows
  arch-x64: x86_64
  arch-linux-x64: amd64
```

**Replaces**: https://github.com/r-lib/actions/tree/v2-branch/setup-pandoc

### More...

If you use this action successful for another tool, please open a PR adding it
to the CI matrix and this README.

---

[LICENSE](./LICENSE) | [CHANGELOG](./CHANGELOG.md)
