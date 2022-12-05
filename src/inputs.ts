export type Platform =
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

export type Arch =
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

export interface GetInputOptions {
  required?: boolean;
}

export interface Core {
  getInput: (name: string, options?: GetInputOptions) => string | null;
}

export interface Inputs {
  name: string;
  version: string;
  url: string;
  subdir: string | null;
  os: string;
  arch: string;
  ext: string;
}

export function getInputs(
  platform: Platform,
  osArch: Arch,
  core: Core
): Inputs {
  const name = requireInput(core, "name");
  const version = requireInput(core, "version");
  const url = requireInputs(core, [`url-${platform}`, "url"]);
  const subdir = optionalInputs(core, [`subdir-${platform}`, "subdir"]);
  const os = defaultedInput(core, `remap-os-${platform}`, platform);
  const arch = defaultedInputs(
    core,
    [`remap-arch-${platform}-${osArch}`, `remap-arch-${osArch}`],
    osArch
  );
  const ext = defaultedInput(
    core,
    `remap-ext-${platform}`,
    inferExtension(platform)
  );

  return {
    name,
    version,
    url,
    subdir,
    os,
    arch,
    ext,
  };
}

function requireInput(core: Core, input: string): string {
  return requireInputs(core, [input]);
}

function requireInputs(core: Core, inputs: string[]): string {
  const value = inputs.map((x) => core.getInput(x)).find((x) => x);

  if (!value) {
    throw new Error(`You must supply one of ${inputs} as an input`);
  }

  return value;
}

function optionalInputs(core: Core, inputs: string[]): string | null {
  const value = inputs.map((x) => core.getInput(x)).find((x) => x);
  return value ? value : null;
}

function defaultedInput(core: Core, input: string, def: string): string {
  return defaultedInputs(core, [input], def);
}

function defaultedInputs(core: Core, inputs: string[], def: string): string {
  const value = inputs.map((x) => core.getInput(x)).find((x) => x);
  return value ? value : def;
}

function inferExtension(platform: Platform): string {
  switch (platform) {
    case "win32":
      return "zip";
    default:
      return "tar.gz";
  }
}
