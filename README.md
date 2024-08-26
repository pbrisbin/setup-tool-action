# Setup Tool Action

Generic action for installation of any tool that offers pre-compiled binaries
for download.

## Motivation

[`@actions/tool-cache`][tc] exists to help download pre-compiled binaries and
add them to `$PATH`. However, its ergonomics are such that distinct actions for
specific tools are necessary to wrap it into something useful. For the most
part, the wrapping is required to manage variation in the release URLs such as
the position and names used for things like "os" or "architecture".

[tc]: https://github.com/actions/toolkit/tree/main/packages/tool-cache

This doesn't scale. Instead, this action abstracts over that and offers good
ergonomics for users to specify any variation directly via `inputs`. This should
allow the action to be used easily for _any_ such case, and obviate any
tool-specific actions or support cases for which a tool-specific action doesn't
exist, without having to create one.

## Types

The [`action-types`](action-types.yml) allows using this action with
[github-workflows-kt][kt], which allows writing workflow files in a type-safe
Kotlin DSL.

[kt]: https://github.com/typesafegithub/github-workflows-kt

## Usage

Look at the typical URLs for the binary assets you intend to install. Compare
what you see to the default values for `os`, `arch`, and `ext` for the runners
you plan to use:

| Runner           | Platform / {os} | Arch / {arch} | {ext}    |
| ---------------- | --------------- | ------------- | -------- |
| `ubuntu-latest`  | `linux`         | `x64`         | `tar.gz` |
| `macos-latest`   | `darwin`        | `arm64`       | `tar.gz` |
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

If the values are _not_ correct, you can supply additional inputs to correct
them.

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

<!-- action-docs-inputs action="action.yml" -->

## Inputs

| name                  | description                                                                                                                                                                                                                                                                                                                                                                                                                   | required | default |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `name`                | <p>Name of the tool</p>                                                                                                                                                                                                                                                                                                                                                                                                       | `true`   | `""`    |
| `version`             | <p>Version of the tool</p>                                                                                                                                                                                                                                                                                                                                                                                                    | `true`   | `""`    |
| `url`                 | <p>URL to installation archive. This value may contain interpolations for name, version, os, arch, and extension.</p> <p><code>http://example.com/binaries/{name}/{version}.{os}_{arch}.{ext}</code></p> <p><code>{name}</code> and <code>{version}</code> will match the other inputs. <code>{os}</code>, <code>{arch}</code> and <code>{ext}</code>, will be inferred, but can be changed by setting additional inputs.</p> | `false`  | `""`    |
| `subdir`              | <p>Subdirectory within the archive to find the executable(s). Supports the same interpolations as <code>url</code>.</p>                                                                                                                                                                                                                                                                                                       | `false`  | `""`    |
| `os`                  | <p><code>{os}</code> to use instead of <code>process.platform</code></p>                                                                                                                                                                                                                                                                                                                                                      | `false`  | `""`    |
| `arch`                | <p><code>{arch}</code> to use instead of <code>process.arch</code></p>                                                                                                                                                                                                                                                                                                                                                        | `false`  | `""`    |
| `ext`                 | <p><code>{ext}</code> to use instead of inferring</p>                                                                                                                                                                                                                                                                                                                                                                         | `false`  | `""`    |
| `no-extract`          | <p>Do not extract the asset as an archive. Rather, expect that it represents the (only) binary itself. It will be downloaded, cached, and available on <code>$PATH</code> as <code>{name}</code>.</p>                                                                                                                                                                                                                         | `false`  | `""`    |
| `url-darwin`          | <p><code>url</code> when <code>platform==darwin</code></p>                                                                                                                                                                                                                                                                                                                                                                    | `false`  | `""`    |
| `url-linux`           | <p><code>url</code> when <code>platform==linux</code></p>                                                                                                                                                                                                                                                                                                                                                                     | `false`  | `""`    |
| `url-win32`           | <p><code>url</code> when <code>platform==win32</code></p>                                                                                                                                                                                                                                                                                                                                                                     | `false`  | `""`    |
| `url-x64`             | <p><code>url</code> when <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                                                           | `false`  | `""`    |
| `url-darwin-x64`      | <p><code>url</code> when <code>platform==darwin</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                         | `false`  | `""`    |
| `url-darwin-arm64`    | <p><code>url</code> when <code>platform==darwin</code> and <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                                       | `false`  | `""`    |
| `url-linux-x64`       | <p><code>url</code> when <code>platform==linux</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                          | `false`  | `""`    |
| `url-win32-x64`       | <p><code>url</code> when <code>platform==win33</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                          | `false`  | `""`    |
| `subdir-darwin`       | <p><code>subdir</code> when <code>platform==darwin</code></p>                                                                                                                                                                                                                                                                                                                                                                 | `false`  | `""`    |
| `subdir-linux`        | <p><code>subdir</code> when <code>platform==linux</code></p>                                                                                                                                                                                                                                                                                                                                                                  | `false`  | `""`    |
| `subdir-win32`        | <p><code>subdir</code> when <code>platform==win32</code></p>                                                                                                                                                                                                                                                                                                                                                                  | `false`  | `""`    |
| `subdir-x64`          | <p><code>subdir</code> when <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                                                        | `false`  | `""`    |
| `subdir-arm64`        | <p><code>subdir</code> when <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                                                                      | `false`  | `""`    |
| `subdir-darwin-x64`   | <p><code>subdir</code> when <code>platform==darwin</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                      | `false`  | `""`    |
| `subdir-darwin-arm64` | <p><code>subdir</code> when <code>platform==darwin</code> and <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                                    | `false`  | `""`    |
| `subdir-linux-x64`    | <p><code>subdir</code> when <code>platform==linux</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                       | `false`  | `""`    |
| `subdir-win32-x64`    | <p><code>subdir</code> when <code>platform==win33</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                       | `false`  | `""`    |
| `os-darwin`           | <p><code>{os}</code> to use when <code>platform==darwin</code></p>                                                                                                                                                                                                                                                                                                                                                            | `false`  | `""`    |
| `os-linux`            | <p><code>{os}</code> to use when <code>platform==linux</code></p>                                                                                                                                                                                                                                                                                                                                                             | `false`  | `""`    |
| `os-win32`            | <p><code>{os}</code> to use when <code>platform==win32</code></p>                                                                                                                                                                                                                                                                                                                                                             | `false`  | `""`    |
| `os-x64`              | <p><code>{os}</code> to use when <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                                                   | `false`  | `""`    |
| `os-arm64`            | <p><code>{os}</code> to use when <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                                                                 | `false`  | `""`    |
| `os-darwin-x64`       | <p><code>{os}</code> to use when <code>platform==darwin</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                 | `false`  | `""`    |
| `os-darwin-arm64`     | <p><code>{os}</code> to use when <code>platform==darwin</code> and <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                               | `false`  | `""`    |
| `os-linux-x64`        | <p><code>{os}</code> to use when <code>platform==linux</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                  | `false`  | `""`    |
| `os-win32-x64`        | <p><code>{os}</code> to use when <code>platform==win32</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                  | `false`  | `""`    |
| `arch-darwin`         | <p><code>{arch}</code> to use when <code>platform==darwin</code></p>                                                                                                                                                                                                                                                                                                                                                          | `false`  | `""`    |
| `arch-linux`          | <p><code>{arch}</code> to use when <code>platform==linux</code></p>                                                                                                                                                                                                                                                                                                                                                           | `false`  | `""`    |
| `arch-win32`          | <p><code>{arch}</code> to use when <code>platform==win32</code></p>                                                                                                                                                                                                                                                                                                                                                           | `false`  | `""`    |
| `arch-x64`            | <p><code>{arch}</code> to use when <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                                                 | `false`  | `""`    |
| `arch-arm64`          | <p><code>{arch}</code> to use when <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                                                               | `false`  | `""`    |
| `arch-darwin-x64`     | <p><code>{arch}</code> to use when <code>platform==darwin</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                               | `false`  | `""`    |
| `arch-darwin-arm64`   | <p><code>{arch}</code> to use when <code>platform==darwin</code> and <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                             | `false`  | `""`    |
| `arch-linux-x64`      | <p><code>{arch}</code> to use when <code>platform==linux</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                | `false`  | `""`    |
| `arch-win32-x64`      | <p><code>{arch}</code> to use when <code>platform==win32</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                | `false`  | `""`    |
| `ext-darwin`          | <p><code>{ext}</code> to use when <code>platform==darwin</code></p>                                                                                                                                                                                                                                                                                                                                                           | `false`  | `""`    |
| `ext-linux`           | <p><code>{ext}</code> to use when <code>platform==linux</code></p>                                                                                                                                                                                                                                                                                                                                                            | `false`  | `""`    |
| `ext-win32`           | <p><code>{ext}</code> to use when <code>platform==win32</code></p>                                                                                                                                                                                                                                                                                                                                                            | `false`  | `""`    |
| `ext-x64`             | <p><code>{ext}</code> to use when <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                                                  | `false`  | `""`    |
| `ext-arm64`           | <p><code>{ext}</code> to use when <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                                                                | `false`  | `""`    |
| `ext-darwin-x64`      | <p><code>{ext}</code> to use when <code>platform==darwin</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                | `false`  | `""`    |
| `ext-darwin-arm64`    | <p><code>{ext}</code> to use when <code>platform==darwin</code> and <code>arch==arm64</code></p>                                                                                                                                                                                                                                                                                                                              | `false`  | `""`    |
| `ext-linux-x64`       | <p><code>{ext}</code> to use when <code>platform==linux</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                 | `false`  | `""`    |
| `ext-win32-x64`       | <p><code>{ext}</code> to use when <code>platform==win33</code> and <code>arch==x64</code></p>                                                                                                                                                                                                                                                                                                                                 | `false`  | `""`    |
| `github-token`        | <p>If present, and <code>url</code> is to a GitHub release asset, we will assume it's private and use this token to download the asset through the GitHub API.</p> <p>https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28#get-a-release-asset</p>                                                                                                                                                           | `false`  | `""`    |

<!-- action-docs-inputs action="action.yml" -->

<!-- action-docs-outputs action="action.yml" -->

## Outputs

| name        | description                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `directory` | <p>Directory that was added to <code>$PATH</code> as result of setup.</p>                                                                                                                                    |
| `file`      | <p>This is always <code>outputs.directory/inputs.name</code>, which will <em>usually</em> match the path to the downloaded and extracted binary. Only use this output if you expect that to be the case.</p> |

<!-- action-docs-outputs action="action.yml" -->

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
