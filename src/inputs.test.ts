import { getInputs } from "./inputs";

function defaultGetInput(input: string): string | null {
  switch (input) {
    case "name":
      return "tool";
    case "version":
      return "0.0.0";
    case "url":
      return "https://example.com";
    case "github-token-for-latest":
      return "xxx";
    default:
      return null;
  }
}

describe("getInputs", () => {
  test("with only url specified", () => {
    const core = {
      getInput: defaultGetInput,
    };

    const { name, version, url, subdir, os, arch, ext } = getInputs(
      "darwin",
      "arm",
      core,
    );

    expect(name).toEqual("tool");
    expect(version).toEqual("0.0.0");
    expect(url).toEqual("https://example.com");
    expect(subdir).toEqual(null);
    expect(os).toEqual("darwin");
    expect(arch).toEqual("arm");
    expect(ext).toEqual("tar.gz");
  });

  test("overriding url by platform", () => {
    const core = {
      getInput: (input: string): string | null => {
        switch (input) {
          case "url-linux":
            return "https://example-linux.com";
          default:
            return defaultGetInput(input);
        }
      },
    };

    const { url: urlDarwin } = getInputs("darwin", "arm", core);
    const { url: urlLinux } = getInputs("linux", "x64", core);

    expect(urlDarwin).toEqual("https://example.com");
    expect(urlLinux).toEqual("https://example-linux.com");
  });

  test("remapping arch", () => {
    const core = {
      getInput: (input: string): string | null => {
        switch (input) {
          case "arch":
            return "x86_64";
          case "arch-darwin-x64":
            return "arm";
          default:
            return defaultGetInput(input);
        }
      },
    };

    const { arch: archDarwin } = getInputs("darwin", "x64", core);
    const { arch: archLinux } = getInputs("linux", "x64", core);

    expect(archDarwin).toEqual("arm");
    expect(archLinux).toEqual("x86_64");
  });

  test("remapping arch by platform", () => {
    const core = {
      getInput: (input: string): string | null => {
        switch (input) {
          case "arch-linux-x64":
            return "amd64";
          case "arch-win32-x64":
            return "x86_64";
          default:
            return defaultGetInput(input);
        }
      },
    };

    const { arch: archDarwin } = getInputs("darwin", "arm", core);
    const { arch: archLinux } = getInputs("linux", "x64", core);
    const { arch: archWin32 } = getInputs("win32", "x64", core);

    expect(archDarwin).toEqual("arm");
    expect(archLinux).toEqual("amd64");
    expect(archWin32).toEqual("x86_64");
  });

  test("remapping ext by platform", () => {
    const core = {
      getInput: (input: string): string | null => {
        switch (input) {
          case "ext-win32":
            return "7z";
          default:
            return defaultGetInput(input);
        }
      },
    };

    const { ext: extLinux } = getInputs("linux", "x64", core);
    const { ext: extWin32 } = getInputs("win32", "x64", core);

    expect(extLinux).toEqual("tar.gz");
    expect(extWin32).toEqual("7z");
  });
});
