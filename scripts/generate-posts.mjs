import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_CATEGORIES = ["algorithm", "project", "cs", "blog"];
const ALLOWED_STATUSES = ["draft", "published", "archived"];
const BLOG_MDX_COMPONENTS = new Set(["Callout", "Aside", "ImageFigure", "YouTube"]);
const RESERVED_BLOG_SEGMENTS = new Set(["algorithm", "project", "cs", "blog", "page", "tag"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_POSTS_REPO_PATH = "../houkago.posts";
const GENERATED_DIR = path.resolve(PROJECT_ROOT, ".generated");
const MANIFEST_PATH = path.join(GENERATED_DIR, "posts-manifest.json");
const PUBLIC_ASSET_ROOT = path.resolve(PROJECT_ROOT, "public", "generated", "posts");
const PUBLIC_ASSET_BASE = "/generated/posts";

function main() {
  const postsRepo = resolvePostsRepository();
  ensureDirectoryExists(postsRepo.absolutePath, buildMissingPostsRepoMessage(postsRepo));
  resetDirectory(GENERATED_DIR);
  resetDirectory(PUBLIC_ASSET_ROOT);

  const errors = [];
  const slugSet = new Map();
  const discoveredIndexFiles = findIndexFiles(postsRepo.absolutePath, errors);
  const posts = [];

  for (const indexFilePath of discoveredIndexFiles) {
    try {
      const post = buildPost(indexFilePath, slugSet, postsRepo.absolutePath);
      posts.push(post);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (discoveredIndexFiles.length === 0) {
    errors.push(
      `No post files were found in ${postsRepo.absolutePath}. Expected canonical paths like {category}/{slug}/index.md.`,
    );
  }

  if (errors.length > 0) {
    console.error("Post content validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourcePath: postsRepo.absolutePath,
    sourcePathInput: postsRepo.inputPath,
    sourcePathStrategy: postsRepo.strategy,
    publicAssetBase: PUBLIC_ASSET_BASE,
    posts: posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)),
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Generated ${manifest.posts.length} posts from ${postsRepo.absolutePath} (${postsRepo.strategy})`);
}

function resolvePostsRepository() {
  const configuredPath = process.env.POSTS_REPO_PATH?.trim();
  const inputPath = configuredPath || DEFAULT_POSTS_REPO_PATH;

  return {
    inputPath,
    absolutePath: path.resolve(PROJECT_ROOT, inputPath),
    strategy: configuredPath ? "env" : "default",
  };
}

function buildMissingPostsRepoMessage(postsRepo) {
  return [
    "Posts repository not found.",
    `- resolved path: ${postsRepo.absolutePath}`,
    `- resolution: ${postsRepo.strategy === "env" ? "POSTS_REPO_PATH" : `default fallback (${DEFAULT_POSTS_REPO_PATH})`}`,
    `- input value: ${postsRepo.inputPath}`,
    `- project root: ${PROJECT_ROOT}`,
    `- current working directory: ${process.cwd()}`,
    'Set POSTS_REPO_PATH to the checked out houkago.posts directory, or place houkago.posts next to houkago.blog for local development.',
  ].join("\n");
}

function findIndexFiles(rootDir, errors) {
  const results = [];

  walk(rootDir, (entryPath, entry) => {
    if (!entry.isFile() || entry.name !== "index.md") {
      return;
    }

    const relativePath = toPosix(path.relative(rootDir, entryPath));
    const segments = relativePath.split("/");

    if (segments.length !== 3) {
      errors.push(`Invalid post path "${relativePath}". Expected {category}/{slug}/index.md.`);
      return;
    }

    const [category] = segments;
    if (!ALLOWED_CATEGORIES.includes(category)) {
      errors.push(`Invalid category path "${relativePath}". Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}.`);
      return;
    }

    results.push(entryPath);
  });

  return results;
}

function buildPost(indexFilePath, slugSet, postsRepoPath) {
  const relativePath = toPosix(path.relative(postsRepoPath, indexFilePath));
  const [categoryDir, slugDir] = relativePath.split("/");
  const postDir = path.dirname(indexFilePath);
  const rawSource = fs.readFileSync(indexFilePath, "utf8");
  const { frontmatter, body } = parseMarkdownFile(rawSource, relativePath);

  validateRequiredFields(frontmatter, relativePath);
  validateStringEnum("status", frontmatter.status, ALLOWED_STATUSES, relativePath);
  validateStringEnum("category", frontmatter.category, ALLOWED_CATEGORIES, relativePath);
  validateDateField("date", frontmatter.date, relativePath);

  if (frontmatter.updated !== undefined) {
    validateDateField("updated", frontmatter.updated, relativePath);
  }

  validateBodyByCategory(body, frontmatter.category, relativePath);

  if (frontmatter.slug !== slugDir) {
    throw new Error(`Slug mismatch in "${relativePath}". Folder name "${slugDir}" must match frontmatter slug "${frontmatter.slug}".`);
  }

  if (frontmatter.category !== categoryDir) {
    throw new Error(`Category mismatch in "${relativePath}". Directory "${categoryDir}" must match frontmatter category "${frontmatter.category}".`);
  }

  if (RESERVED_BLOG_SEGMENTS.has(frontmatter.slug)) {
    throw new Error(`Slug "${frontmatter.slug}" is reserved because it conflicts with blog routing.`);
  }

  const existingSlugPath = slugSet.get(frontmatter.slug);
  if (existingSlugPath) {
    throw new Error(`Duplicate slug "${frontmatter.slug}" found in "${relativePath}" and "${existingSlugPath}".`);
  }
  slugSet.set(frontmatter.slug, relativePath);

  const normalized = {
    title: frontmatter.title,
    slug: frontmatter.slug,
    date: frontmatter.date,
    description: frontmatter.description,
    category: frontmatter.category,
    status: frontmatter.status,
    tags: normalizeTags(frontmatter.tags, relativePath),
    updated: normalizeOptionalString(frontmatter.updated, "updated", relativePath),
    thumbnail: normalizeAssetField(frontmatter.thumbnail, postDir, frontmatter.category, frontmatter.slug, "thumbnail", relativePath),
    series: normalizeOptionalString(frontmatter.series, "series", relativePath),
    featured: normalizeOptionalBoolean(frontmatter.featured, "featured", relativePath),
    draftNote: normalizeOptionalString(frontmatter.draftNote, "draftNote", relativePath),
    body: rewriteMarkdownAssetPaths(body, postDir, frontmatter.category, frontmatter.slug, relativePath),
    path: relativePath,
  };

  copyAssetsDirectory(postDir, frontmatter.category, frontmatter.slug);
  return normalized;
}

function parseMarkdownFile(source, relativePath) {
  const normalizedSource = source.replace(/\r\n/g, "\n");
  if (!normalizedSource.startsWith("---\n")) {
    throw new Error(`Missing frontmatter in "${relativePath}".`);
  }

  const closingMarkerIndex = normalizedSource.indexOf("\n---\n", 4);
  if (closingMarkerIndex === -1) {
    throw new Error(`Unclosed frontmatter block in "${relativePath}".`);
  }

  const frontmatterSource = normalizedSource.slice(4, closingMarkerIndex);
  const body = normalizedSource.slice(closingMarkerIndex + 5).trim();

  return {
    frontmatter: parseFrontmatter(frontmatterSource, relativePath),
    body,
  };
}

function parseFrontmatter(source, relativePath) {
  const result = {};
  const lines = source.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    const match = /^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(line);
    if (!match) {
      throw new Error(`Invalid frontmatter line "${line}" in "${relativePath}".`);
    }

    const [, key, rawValue] = match;

    if (!rawValue.trim()) {
      const items = [];
      while (index + 1 < lines.length) {
        const nextLine = lines[index + 1];
        const listMatch = /^\s*-\s*(.*)$/.exec(nextLine);
        if (!listMatch) {
          break;
        }

        items.push(parseScalar(listMatch[1]));
        index += 1;
      }
      result[key] = items;
      continue;
    }

    result[key] = parseScalar(rawValue);
  }

  return result;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) {
      return [];
    }

    return inner.split(",").map((item) => parseScalar(item));
  }

  return trimmed;
}

function validateBodyByCategory(body, category, relativePath) {
  const analyzableBody = stripCodeLiterals(body);

  validateForbiddenMdxJavaScript(analyzableBody, relativePath);

  if (category === "blog") {
    validateAllowedBlogMdx(analyzableBody, relativePath);
    return;
  }

  validateMarkdownSubset(analyzableBody, category, relativePath);
}

function stripCodeLiterals(source) {
  return source
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/~~~[\s\S]*?~~~/g, "\n")
    .replace(/`[^`\n]*`/g, "");
}

function validateForbiddenMdxJavaScript(source, relativePath) {
  if (/^\s*(?:import|export)\s/m.test(source)) {
    throw new Error(`Unsupported MDX module syntax in "${relativePath}". import/export are not allowed in post bodies.`);
  }

  if (/<[A-Za-z][^>\n]*\{[^}\n]+\}[^>\n]*>/.test(source) || /(^|\n)\s*\{[^{}\n]+\}\s*($|\n)/.test(source)) {
    throw new Error(`Unsupported MDX JavaScript expression in "${relativePath}". Curly-brace expressions are disabled.`);
  }
}

function validateMarkdownSubset(source, category, relativePath) {
  if (/(?<!\\)<\/?[A-Za-z][^>\n]*>|<!--/.test(source)) {
    throw new Error(
      `Invalid body syntax in "${relativePath}". ${category} posts must stay within the Markdown subset and cannot contain HTML or MDX tags.`,
    );
  }
}

function validateAllowedBlogMdx(source, relativePath) {
  for (const match of source.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)) {
    const componentName = match[1];
    if (!BLOG_MDX_COMPONENTS.has(componentName)) {
      throw new Error(
        `Unsupported MDX component "${componentName}" in "${relativePath}". Blog posts may only use: ${Array.from(BLOG_MDX_COMPONENTS).join(", ")}.`,
      );
    }
  }

  for (const match of source.matchAll(/<ImageFigure\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/g)) {
    const src = match[1];
    if (!isAllowedBlogMediaSource(src)) {
      throw new Error(
        `Invalid ImageFigure src "${src}" in "${relativePath}". Use a public path beginning with "/" or an absolute URL.`,
      );
    }
  }

  for (const match of source.matchAll(/<YouTube\b([^>]*)>/g)) {
    const attributes = match[1];
    const idMatch = /\bid\s*=\s*["']([^"']+)["']/.exec(attributes);

    if (!idMatch) {
      throw new Error(`Invalid YouTube usage in "${relativePath}". The YouTube component requires an id prop.`);
    }

    if (!/^[A-Za-z0-9_-]{11}$/.test(idMatch[1])) {
      throw new Error(`Invalid YouTube id "${idMatch[1]}" in "${relativePath}". Expected an 11-character video id.`);
    }
  }
}

function isAllowedBlogMediaSource(source) {
  return source.startsWith("/") || /^(?:https?:)?\/\//i.test(source);
}

function validateRequiredFields(frontmatter, relativePath) {
  const requiredFields = ["title", "slug", "date", "description", "category", "status"];
  for (const field of requiredFields) {
    if (typeof frontmatter[field] !== "string" || !frontmatter[field].trim()) {
      throw new Error(`Missing required frontmatter field "${field}" in "${relativePath}".`);
    }
  }
}

function validateStringEnum(field, value, allowedValues, relativePath) {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw new Error(`Invalid ${field} "${String(value)}" in "${relativePath}". Allowed values: ${allowedValues.join(", ")}.`);
  }
}

function validateDateField(field, value, relativePath) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new Error(`Invalid ${field} "${String(value)}" in "${relativePath}". Expected YYYY-MM-DD.`);
  }
}

function normalizeTags(value, relativePath) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`Invalid tags in "${relativePath}". Tags must be an array of strings.`);
  }

  return value.map((tag) => {
    if (typeof tag !== "string" || !tag.trim()) {
      throw new Error(`Invalid tag value "${String(tag)}" in "${relativePath}".`);
    }
    return tag.trim();
  });
}

function normalizeOptionalString(value, field, relativePath) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${field} in "${relativePath}". Expected a non-empty string.`);
  }

  return value.trim();
}

function normalizeOptionalBoolean(value, field, relativePath) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${field} in "${relativePath}". Expected true or false.`);
  }

  return value;
}

function normalizeAssetField(value, postDir, category, slug, field, relativePath) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${field} in "${relativePath}". Expected a string path.`);
  }

  return resolveAssetReference(value.trim(), postDir, category, slug, relativePath, field);
}

function rewriteMarkdownAssetPaths(body, postDir, category, slug, relativePath) {
  return body.replace(/(!?\[[^\]]*\]\()([^)]+)(\))/g, (match, prefix, rawTarget, suffix) => {
    const cleanedTarget = rawTarget.trim().replace(/^<|>$/g, "");

    if (!isLocalAssetReference(cleanedTarget)) {
      return match;
    }

    const resolvedTarget = resolveAssetReference(cleanedTarget, postDir, category, slug, relativePath, "body asset");
    return `${prefix}${resolvedTarget}${suffix}`;
  });
}

function resolveAssetReference(rawTarget, postDir, category, slug, relativePath, field) {
  if (!isLocalAssetReference(rawTarget)) {
    return rawTarget;
  }

  const absoluteTargetPath = path.resolve(postDir, rawTarget);
  if (!absoluteTargetPath.startsWith(postDir)) {
    throw new Error(`Invalid ${field} path "${rawTarget}" in "${relativePath}". Asset references must stay within the post directory.`);
  }

  if (!fs.existsSync(absoluteTargetPath)) {
    throw new Error(`Missing ${field} "${rawTarget}" in "${relativePath}". Resolved path: ${absoluteTargetPath}`);
  }

  const stat = fs.statSync(absoluteTargetPath);
  if (!stat.isFile()) {
    throw new Error(`Invalid ${field} "${rawTarget}" in "${relativePath}". Expected a file.`);
  }

  const relativeAssetPath = toPosix(path.relative(postDir, absoluteTargetPath));
  return `${PUBLIC_ASSET_BASE}/${category}/${slug}/${relativeAssetPath}`;
}

function copyAssetsDirectory(postDir, category, slug) {
  const destinationDir = path.join(PUBLIC_ASSET_ROOT, category, slug);
  ensureDirectory(destinationDir);

  for (const entry of fs.readdirSync(postDir, { withFileTypes: true })) {
    if (entry.name === "index.md") {
      continue;
    }

    const sourcePath = path.join(postDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function copyDirectoryRecursive(sourceDir, destinationDir) {
  ensureDirectory(destinationDir);

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function isLocalAssetReference(target) {
  return !/^(?:[a-z]+:|#|\/)/i.test(target);
}

function walk(currentDir, visitor) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const entryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      walk(entryPath, visitor);
      continue;
    }

    visitor(entryPath, entry);
  }
}

function ensureDirectoryExists(directoryPath, message) {
  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    throw new Error(message);
  }
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function resetDirectory(directoryPath) {
  fs.rmSync(directoryPath, { recursive: true, force: true });
  ensureDirectory(directoryPath);
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

main();
