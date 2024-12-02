import { toGitHubAssetUrl } from "./github";

describe("toGitHubAssetUrl", () => {
  test("it parses a github.com asset URL", () => {
    const input =
      "https://github.com/pbrisbin/litx/releases/download/v0.0.0.2/litx-x86_64-linux.tar.gz";
    const expected = {
      owner: "pbrisbin",
      repo: "litx",
      tag: "v0.0.0.2",
      name: "litx-x86_64-linux.tar.gz",
    };

    const actual = toGitHubAssetUrl(input);

    expect(actual).not.toBeNull();
    expect(actual).toEqual(expected);
  });

  test("it returns null unless github.com URL", () => {
    const input =
      "https://githubx.com/pbrisbin/litx/releases/download/v0.0.0.2/litx-x86_64-linux.tar.gz";

    const actual = toGitHubAssetUrl(input);

    expect(actual).toBeNull();
  });

  test("it returns null for github.com non-release URLs", () => {
    const input =
      "https://github.com/pbrisbin/litx/tree/main/assets/litx-v0.0.0.2-x86_64-linux.tar.gz";

    const actual = toGitHubAssetUrl(input);

    expect(actual).toBeNull();
  });
});
