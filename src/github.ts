import * as core from "@actions/core";
import * as github from "@actions/github";
import { OutgoingHttpHeaders } from "http";

import { GitHubAssetUrl, toGitHubAssetUrl } from "./github-asset-url";

export interface DownloadArgs {
  url: string;
  auth: string | undefined;
  headers: OutgoingHttpHeaders | undefined;
}

export async function findReleaseAsset(
  url: string,
  githubToken: string,
): Promise<DownloadArgs> {
  const assetUrl = toGitHubAssetUrl(url);

  if (!assetUrl) {
    core.error(`${url} did not parse as a GitHub release asset`);
    return { url, auth: undefined, headers: undefined };
  }

  core.info(
    `Parsed as asset-url, ${assetUrl.owner}/${assetUrl.repo} ${assetUrl.tag} ${assetUrl.name}`,
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
      .join(", ")}`,
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

export async function getLatestRelease(
  url: string,
  githubToken: string,
): Promise<string> {
  const assetUrl = toGitHubAssetUrl(url);

  if (!assetUrl) {
    throw new Error(
      "URL is not a GitHub release asset, version cannot be omitted",
    );
  }

  const { owner, repo } = assetUrl;
  core.info(`URL is to a GitHub Asset in ${owner}/${repo}`);
  const client = github.getOctokit(githubToken);

  const { data } = await client.rest.repos.getLatestRelease({ owner, repo });
  core.debug(`Latest release: ${JSON.stringify(data)}`);

  const version = data.tag_name.replace(/^v/, "");
  core.info(`Inferred version from release: ${version}`);

  return version;
}
