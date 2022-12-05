import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as os from "os";
import * as path from "path";
import { interpolate } from "./interpolate";

type Platform =
  | "aix"
  | "android"
  | "cygwin"
  | "darwin"
  | "freebsd"
  | "haiku"
  | "linux"
  | "netbsd"
  | "openbsd"
  | "sunos"
  | "win32";

type Arch =
  | "arm"
  | "arm64"
  | "ia32"
  | "mips"
  | "mipsel"
  | "ppc"
  | "ppc64"
  | "s390"
  | "s390x"
  | "x64";

type PkgExtension = "tar.gz" | "zip";

function getExtract(
  ext: PkgExtension
): (archivePath: string, toDir: string) => Promise<string> {
  switch (ext) {
    case "tar.gz":
      return tc.extractTar;
    case "zip":
      return tc.extractZip;
  }

  // TODO:
  //   pkg -> extractXar
  //   7z -> extract7z
  //   ? -> extractZipWin
  //   ? -> extractZipNix
}

interface ToolConfig {
  name: string;
  version: string;
  arch: Arch;
}

interface ArchiveConfig {
  url: string;
  subdir: string | null;
  extract: (archivePath: string, toDir: string) => Promise<string>;
}

interface ReleaseConfig {
  tool: ToolConfig;
  archive: ArchiveConfig;
}

function remapInput(name: string, input: string): string {
  const value = core.getInput(`remap-${name}-${input}`);

  if (!value) {
    throw new Error(`
      Unsupported value for ${name}: ${input}

      Please report this to https://github.com/pbrisbin/setup-tool-action/issues.
    `);
  }

  return value;
}

function mkReleaseConfig(platform: Platform, osArch: Arch): ReleaseConfig {
  const name = core.getInput("name", { required: true });
  const version = core.getInput("version", { required: true });
  const urlTemplate = core.getInput("url", { required: true });
  const subdirTemplate = core.getInput("subdir");

  const os = remapInput("os", platform);
  const arch = remapInput("arch", osArch);
  const ext = remapInput("ext", platform);

  const templateVars = { name, version, os, arch, ext };
  const url = interpolate(urlTemplate, templateVars);
  const subdir = subdirTemplate
    ? interpolate(subdirTemplate, templateVars)
    : null;

  return {
    tool: {
      name,
      version,
      arch: osArch,
    },
    archive: {
      url,
      subdir,
      extract: getExtract(ext as PkgExtension),
    },
  };
}

async function download(releaseConfig: ReleaseConfig): Promise<string> {
  const { tool, archive } = releaseConfig;
  const { extract, subdir } = archive;
  const archivePath = await tc.downloadTool(archive.url);
  const archiveDest = path.join(os.homedir(), "tmp");
  const extracted = await extract(archivePath, archiveDest);
  const releaseFolder = subdir ? path.join(extracted, subdir) : extracted;
  return await tc.cacheDir(releaseFolder, tool.name, tool.version, tool.arch);
}

async function findOrDownload(releaseConfig: ReleaseConfig): Promise<string> {
  const { tool, archive } = releaseConfig;
  const { url } = archive;
  const existingDir = await tc.find(tool.name, tool.version, tool.arch);

  if (existingDir) {
    core.debug(`Found cached ${tool.name} at ${existingDir}`);
    return existingDir;
  } else {
    core.debug(`${tool.name} not cached, so attempting to download`);
    return core.group(
      `Downloading ${tool.name} from ${url}`,
      async () => await download(releaseConfig)
    );
  }
}

async function run() {
  try {
    const config = mkReleaseConfig(process.platform, process.arch as Arch);
    const dir = await findOrDownload(config);
    core.addPath(dir);
    core.info(
      `${config.tool.name} ${config.tool.version} is now set up at ${dir}`
    );
  } catch (error) {
    core.setFailed(error instanceof Error ? error : String(error));
  }
}

run();
