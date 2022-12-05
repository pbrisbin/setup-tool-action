# Tool Setup Action

Generic action for cached installation of any tool that offers pre-compiled
binaries for download.

## Motivation

[`@actions/tool-cache`][tc] exists to help download pre-compiled binaries and
cache them. However, its ergonomics are such that distinct actions for specific
tools are necessary to wrap it into something useful. For the most part, the
wrapping is required to manage variation in the release URLs such as the
position and names used for things like "os" or "architecture".

[tc]: #todo

This doesn't scale. Instead, this action abstracts over that and offers good
ergonomics for users to specify any variation directly via `inputs`. This should
allow the action to be used easily for *any* such case, and obviate any
tool-specific actions or support cases for which a tool-specific action doesn't
exist, without having to create one.

See _Examples_ for more details.

## Usage

## Inputs

- **name**: a name for the tool being installed.

- **version**: a version for the tool being installed.

- **url**: a URL to the archive that holds the pre-compiled executable(s). This
  value supports interpolations.

  - `{name}`: will be replaced by `inputs.name`
  - `{version}`: will be replaced by `inputs.version`
  - `{os}`: will be replaced by `process.platform` (see `remap-os-`)
  - `{arch}`: will be replaced by `process.arch` (see `remap-arch-`)
  - `{ext}`: will be replaced by `tar.gz` or `zip` (see `remap-ext-`)

  For example, `http://.../{name}/{os}-{arch}/{version}.{ext}`, on a Linux
  runner, will download `http://.../{name}/linux-x64/{version}.tar.gz`.

- **subdir**: the sub-directory within the downloaded archive where the
  executable(s) can be found. Default is none (they are expected to be
  top-level). Supports the same interpolation values as `url`.

- **remap-os-{darwin|linux|win32}**: values to use as the `{os}` interpolation
  for the given platform. Default behavior is to use them as-is.

- **remap-arch-{arm|arm64|x64}**: values to use as the `{arch}` interpolation
  for the given architecture. Default behavior is to use them as-is.

- **remap-ext-{darwin|linux|win32}**: values to use as the `{ext}` interpolation
  for the given platform. Default is `tar.gz` for `darwin` or `linux`, and `zip`
  for `win32`.

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
  remap-os-darwin: osx
  remap-os-win32: windows
  remap-arch-x64: x86_64
```

**Replaces**: https://github.com/haskell/actions/tree/main/hlint-setup

### Dead Man's Snitch Field Agent

```yaml
with:
  name: dms
  version: latest
  url: "https://releases.deadmanssnitch.com/field-agent/{version}/{name}_{os}_{arch}.{ext}"
  remap-os-darwin: macos
  remap-os-win32: windows
  remap-arch-x64: amd64
```

**Replaces**: N/A

### More...

If you use this action successful for another tool, please open a PR adding it
to the CI matrix and this README.

---

[LICENSE](./LICENSE) | [CHANGELOG](./CHANGELOG.md)
