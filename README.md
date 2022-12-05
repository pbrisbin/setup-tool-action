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

- **name**: the name of the tool being installed. Required.

- **version**: the version of the tool being installed. Required.

- **os**, **arch**, **ext**: change runner-specific values for use in **url**
  and **subdir** template strings.

  | Runner           | Platform / {os} | Arch / {arch} | {ext}    |
  | ---              | ---             | ---           | ---      |
  | `ubuntu-latest`  | `linux`         | `x64`         | `tar.gz` |
  | `macOS-latest`   | `darwin`        | `x64`         | `tar.gz` |
  | `windows-latest` | `win32`         | `x64`         | `zip`    |

- **url**: the URL to the archive containing pre-built binaries. Required.

  This value can contain interpolations of the above inputs.

- **subdir**: a subdirectory within the archive where the executables live.

  This value can contain the same interpolations as **url**.

### Overriding Inputs by Platform/Arch

All options besides **name** and **version** may be specified multiple times for
specific platforms or architectures. They are checked in the following order
(using `url`) and an example:

- `url-<platform>-<arch>`
- `url-<arch>`
- `url-<platform>`
- `url`

**NOTE**: since all GitHub runners currently return `x64` for `process.arch`,
that is the only value our inputs are setup to support. Therefore, specifying
`url-<platform>-x64` will have the same outcome as `url-<platform>`, and
specifying `url-x64` will have the same outcome as `url`. However, we recommend
being explicit with the `x64` value if the tool you are installing does release
architecture-specific archives, to ensure things continue to work if future
architectures are added here.

## Outputs

None.

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

**Can replace**: https://github.com/haskell/actions/tree/main/hlint-setup

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

**Can replace**: N/A

### Pandoc

```yaml
with:
  name: pandoc
  version: 2.19.2
  url: 'https://github.com/jgm/{name}/releases/download/{version}/{name}-{version}-{os}-{arch}.{ext}'
  url-darwin: 'https://github.com/jgm/{name}/releases/download/{version}/{name}-{version}-macOS.zip'
  subdir: '{name}-{version}/bin'
  subdir-win32: '{name}-{version}'
  os-win32: windows
  arch-x64: x86_64
  arch-linux-x64: amd64
```

**Can replace**: https://github.com/r-lib/actions/tree/v2-branch/setup-pandoc

### More...

If you use this action successful for another tool, please open a PR adding it
to the CI matrix and this README.

---

[LICENSE](./LICENSE) | [CHANGELOG](./CHANGELOG.md)
