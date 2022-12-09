import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as os from "os";
import * as path from "path";
import { interpolate } from "./interpolate";
import { type Platform, type Arch, getInputs } from "./inputs";

type PkgExtension = "tar.gz" | "zip" | "7z" | "xar";

function getExtract(
  ext: PkgExtension
): (archivePath: string, toDir: string) => Promise<string> {
  switch (ext) {
    case "tar.gz":
      return tc.extractTar;
    case "zip":
      return tc.extractZip;
    case "7z":
      return tc.extract7z;
    case "xar":
      return tc.extractXar;
  }
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

function mkReleaseConfig(platform: Platform, osArch: Arch): ReleaseConfig {
  const {
    name,
    version,
    url: urlTemplate,
    subdir: subdirTemplate,
    os,
    arch,
    ext,
  } = getInputs(platform, osArch, core);

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
