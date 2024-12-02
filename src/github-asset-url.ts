export interface GitHubAssetUrl {
  owner: string;
  repo: string;
  tag: string;
  name: string;
}

export function toGitHubAssetUrl(url: string): GitHubAssetUrl | null {
  const re = new RegExp(
    [
      "^https://github.com",
      "/(?<owner>[^/]+)",
      "/(?<repo>[^/]+)",
      "/releases/download",
      "/(?<tag>[^/]+)",
      "/(?<name>.+)$",
    ].join(""),
  );

  const match = url.match(re);

  if (!match?.groups) {
    return null;
  }

  return {
    owner: match.groups["owner"],
    repo: match.groups["repo"],
    tag: match.groups["tag"],
    name: match.groups["name"],
  };
}
