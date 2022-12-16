import * as core from "@actions/core";
import * as github from "@actions/github";
import { OutgoingHttpHeaders } from "http";

export interface DownloadArgs {
  url: string;
  auth: string | undefined;
  headers: OutgoingHttpHeaders | undefined;
}

export async function findReleaseAsset(
  url: string,
  githubToken: string
): Promise<DownloadArgs> {
  const assetUrl = toGitHubAssetUrl(url);

  if (!assetUrl) {
    core.error(`${url} did not parse as a GitHub release asset`);
    return { url, auth: undefined, headers: undefined };
  }

  core.info(
    `Parsed as asset-url, ${assetUrl.owner}/${assetUrl.repo} ${assetUrl.tag} ${assetUrl.name}`
  );

  const { owner, repo, tag, name } = assetUrl;
  const octokit = github.getOctokit(githubToken);

  const {
    data: { assets },
  } = await octokit.request("GET /repos/{owner}/{repo}/releases/tags/{tag}", {
    owner,
    repo,
    tag,
  });

  core.info(
    `Release ${tag} contains the following assets: ${assets
      .map((asset) => asset.name)
      .join(", ")}`
  );

  const asset = assets.find((asset) => {
    return asset.name === name;
  });

  if (!asset) {
    core.error(`Release ${tag} does not contain an asset named ${name}`);
    return { url, auth: undefined, headers: undefined };
  }

  core.info(`Located asset, ${asset.id}: ${asset.name}`);

  return {
    url: asset.url,
    auth: `token ${githubToken}`,
    headers: { Accept: "application/octet-stream" },
  };
}

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
    ].join("")
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
