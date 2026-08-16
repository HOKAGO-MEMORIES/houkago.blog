const LOCAL_ASSET_PREFIX = "./assets/";
const PUBLIC_ASSET_PATH_PATTERN = /^\/assets\/posts\/([^/]+)\/$/;

export class PostAssetUrlError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PostAssetUrlError";
  }
}

export function normalizePostAssetBaseUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new PostAssetUrlError("Post asset base URL must be a valid URL.", { cause: error });
  }

  const pathMatch = url.pathname.match(PUBLIC_ASSET_PATH_PATTERN);
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !pathMatch ||
    !isSafeEncodedSegment(pathMatch[1])
  ) {
    throw new PostAssetUrlError(
      "Post asset base URL must use the canonical HTTP(S) /assets/posts/{slug}/ path.",
    );
  }

  return url.toString();
}

export function resolvePostAssetUrl(target: string, assetBaseUrl: string) {
  if (!target.startsWith(LOCAL_ASSET_PREFIX)) {
    return target;
  }

  const normalizedBaseUrl = normalizePostAssetBaseUrl(assetBaseUrl);
  const relativeTarget = target.slice(LOCAL_ASSET_PREFIX.length);
  const suffixIndex = relativeTarget.search(/[?#]/);
  const assetPath = suffixIndex === -1 ? relativeTarget : relativeTarget.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : relativeTarget.slice(suffixIndex);

  if (!assetPath || assetPath.includes("\\")) {
    throw new PostAssetUrlError("Local post asset path must be a non-empty forward-slash path.");
  }

  const segments = assetPath.split("/");
  if (segments.some((segment) => !isSafeEncodedSegment(segment))) {
    throw new PostAssetUrlError("Local post asset path must not traverse or escape its asset root.");
  }

  return new URL(`${assetPath}${suffix}`, normalizedBaseUrl).toString();
}

function isSafeEncodedSegment(segment: string) {
  if (!segment) {
    return false;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return false;
  }

  return (
    decoded !== "." &&
    decoded !== ".." &&
    !decoded.includes("/") &&
    !decoded.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(decoded)
  );
}
