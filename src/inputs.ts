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
  noExtract: boolean;
  githubToken: string | null;
  githubTokenForLatest: string;
}

export function getInputs(
  platform: Platform,
  osArch: Arch,
  core: Core,
): Inputs {
  return {
    name: requireInput(core, ["name"]),
    version: optionalInput(core, ["version"]) || "",
    url: requireInput(core, specifiedInputs(platform, osArch, "url")),
    subdir: optionalInput(core, specifiedInputs(platform, osArch, "subdir")),
    os: optionalInputDefault(
      core,
      specifiedInputs(platform, osArch, "os"),
      platform,
    ),
    arch: optionalInputDefault(
      core,
      specifiedInputs(platform, osArch, "arch"),
      osArch,
    ),
    ext: optionalInputDefault(
      core,
      specifiedInputs(platform, osArch, "ext"),
      inferExtension(platform),
    ),
    noExtract: core.getInput("no-extract", { required: false }) === "true",
    githubToken: core.getInput("github-token", { required: false }),
    githubTokenForLatest: requireInput(core, [
      "github-token",
      "github-token-for-latest",
    ]),
  };
}

function specifiedInputs(
  platform: Platform,
  arch: Arch,
  input: string,
): string[] {
  return [
    `${input}-${platform}-${arch}`,
    `${input}-${arch}`,
    `${input}-${platform}`,
    input,
  ];
}

function requireInput(core: Core, inputs: string[]): string {
  const value = inputs.map((x) => core.getInput(x)).find((x) => x);

  if (!value) {
    const message =
      inputs.length === 1
        ? `You must supply the ${inputs[0]} input`
        : `You must supply one of ${inputs} as an input`;

    throw new Error(message);
  }

  return value;
}

function optionalInput(core: Core, inputs: string[]): string | null {
  const value = inputs.map((x) => core.getInput(x)).find((x) => x);
  return value ? value : null;
}

function optionalInputDefault(
  core: Core,
  inputs: string[],
  def: string,
): string {
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
