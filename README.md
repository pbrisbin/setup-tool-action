# Setup Tool Action

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
allow the action to be used easily for _any_ such case, and obviate any
tool-specific actions or support cases for which a tool-specific action doesn't
exist, without having to create one.

## Usage

Look at the typical URLs for the binary assets you intend to install. Compare
what you see to the default values for `os`, `arch`, and `ext` for the runners
you plan to use:

| Runner           | Platform / {os} | Arch / {arch} | {ext}    |
| ---------------- | --------------- | ------------- | -------- |
| `ubuntu-latest`  | `linux`         | `x64`         | `tar.gz` |
| `macOS-latest`   | `darwin`        | `x64`         | `tar.gz` |
| `windows-latest` | `win32`         | `x64`         | `zip`    |

If the values are correct across all the runners you use, you can do the
following:

```yaml
steps:
  - uses: pbrisbin/setup-tool-action@v2
    with:
      name: my-tool
      version: 1.0.0
      url: "http://releases.my-tool.com/{name}-{version}.{os}-{arch}.{ext}"
```

If the values are _not_ correct, you can supply addition inputs to correct them.

Let's say you are only installing on Linux, and it uses `x86_64` for `arch`:

```yaml
steps:
  - uses: pbrisbin/setup-tool-action@v2
    with:
      name: my-tool
      version: 1.0.0
      url: "http://releases.my-tool.com/{name}-{version}.{os}-{arch}.{ext}"
      arch: x86_64
```

All inputs besides `name` and `version` have suffixed versions that can be used
to supply _different_ values by `platform` and/or `arch`:

- `<input>-<platform>-<arch>`
- `<input>-<arch>`
- `<input>-<platform>`
- `<input>`

The first match found is used.

Now let's say you were installing on Linux and MacOS, and you only want to
change the `arch` for Linux, that would look like:

```yaml
steps:
  - uses: pbrisbin/setup-tool-action@v2
    with:
      name: my-tool
      version: 1.0.0
      url: "http://releases.my-tool.com/{name}-{version}.{os}-{arch}.{ext}"
      arch-linux: x86_64
```

As a final example, let's also say this tool uses the legacy term `osx` for
MacOS artifacts:

```yaml
steps:
  - uses: pbrisbin/setup-tool-action@v2
    with:
      name: my-tool
      version: 1.0.0
      url: "http://releases.my-tool.com/{name}-{version}.{os}-{arch}.{ext}"
      os-darwin: osx
      arch-linux: x86_64
```

For more complex examples, see below or the project's test suite.

## Inputs

- **name**: the name of the tool being installed. Required.

- **version**: the version of the tool being installed. Required.

- **os**, **arch**, **ext**: change runner-specific values for use in **url**
  and **subdir** template strings.

- **url**: the URL to the archive containing pre-built binaries. Required.

  This value can contain interpolations of the above inputs.

- **subdir**: a subdirectory within the archive where the executables live.

  This value can contain the same interpolations as **url**.

- **no-extract**: Do not extract the asset as an archive. Rather, expect that it
  represents the binary itself.

- **github-token**: see _Releases in Private GitHub Repositories_

## Releases in Private GitHub Repositories

To download an asset from a Release in a private GitHub repository,

- Use the URL to the asset as if you were in an authenticated browser (i.e. as
  if it were public)
- Set `github-token` to a token with access to the private repository

The action will parse the `url` for `owner/repo`, `tag` and asset `name`, then
use the GitHub API to find the correct `/releases/assets/{asset-id}` URL and
then download that, all using the given token.

**NOTE**: This currently only works for URLs on `github.com`. PRs welcome if
there's a way to support enterprise or other setups.

## Outputs

None.

## Examples

### HLint

```yaml
with:
  name: "hlint"
  version: "3.5"
  url: "https://github.com/ndmitchell/{name}/releases/download/v{version}/{name}-{version}-{arch}-{os}.{ext}"
  subdir: "{name}-{version}"
  os-darwin: osx
  os-win32: windows
  arch-x64: x86_64
```

**Can replace**: https://github.com/haskell-actions/hlint-setup

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
  url: "https://github.com/jgm/{name}/releases/download/{version}/{name}-{version}-{os}-{arch}.{ext}"
  url-darwin: "https://github.com/jgm/{name}/releases/download/{version}/{name}-{version}-macOS.zip"
  subdir: "{name}-{version}/bin"
  subdir-win32: "{name}-{version}"
  os-win32: windows
  arch-x64: x86_64
  arch-linux-x64: amd64
```

**Can replace**: https://github.com/r-lib/actions/tree/v2-branch/setup-pandoc

### More...

If you use this action successfully for another tool, please open a PR adding it
to the CI matrix and this README.

---

[LICENSE](./LICENSE) | [CHANGELOG](./CHANGELOG.md)
