import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(siteRoot, "data", "catalog.json");
const booksRoot = path.join(siteRoot, "books");
const siteUrl = "https://audio.gnosishanoi.org/";
const siteName = "Sách nói Gnosis Hà Nội";
const appVersion = "gnosis-editorial-37";

const canonicalBookSlugs = {
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "tam-ly-hoc-cho-su-thay-doi-triet-de"
};

const knownCoverPaths = {
  "dayspring-of-youth": "assets/covers/dayspring-of-youth-gnosis-v2.png?v=2",
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "assets/covers/tam-ly-hoc-cho-su-thay-doi-triet-de-gnosis-v2.jpg?v=2",
  "xu-xo-cua-cac-vi-than": "assets/covers/xu-xo-cua-cac-vi-than-gnosis-v3.png?v=3"
};

const knownSocialImagePaths = {
  "dayspring-of-youth": "assets/social/dayspring-of-youth-gnosis-v3.jpg",
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "assets/social/gnosis-hanoi-library-v3.jpg",
  "xu-xo-cua-cac-vi-than": "assets/social/xu-xo-cua-cac-vi-than-gnosis-v3.jpg"
};

const descriptionFallbacks = {
  "dayspring-of-youth": "A contemplative study of subtle nature, inner life, and the awakening of human consciousness.",
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "Những bài giảng về quan sát bản thân, chuyển hóa tâm lý và đánh thức ý thức.",
  "xu-xo-cua-cac-vi-than": "Cuộc diện kiến các Chân sư Minh triết ở Shambhala."
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function normalizeAsset(assetPath, bookId) {
  const fallback = knownCoverPaths[bookId] || "assets/icons/icon-512.png";
  const value = assetPath || fallback;
  return value.replace(/^\.\//, "");
}

function cleanAssetUrl(assetPath) {
  return assetPath.split("?")[0];
}

function absoluteSiteUrl(relativePath) {
  return new URL(relativePath, siteUrl).href;
}

function bookDescription(book) {
  return book.description || book.subtitle || descriptionFallbacks[book.id] || [
    book.author ? `Author: ${book.author}` : "",
    book.narrator ? `Narrator: ${book.narrator}` : "",
    `${book.chapters?.length || 0} chapter${book.chapters?.length === 1 ? "" : "s"}`
  ].filter(Boolean).join(" · ");
}

function htmlForBook(book) {
  const title = `${book.title} | ${siteName}`;
  const description = bookDescription(book);
  const coverPath = normalizeAsset(book.cover, book.id);
  const socialImagePath = knownSocialImagePaths[book.id] || cleanAssetUrl(coverPath);
  const socialImage = absoluteSiteUrl(socialImagePath);
  const pageSlug = canonicalBookSlugs[book.id] || book.id;
  const pageUrl = absoluteSiteUrl(`books/${pageSlug}/`);
  const appUrl = absoluteSiteUrl(`#book/${pageSlug}`);

  return `<!doctype html>
<html lang="${book.language || "en"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(pageUrl)}">
    <meta property="og:type" content="music.album">
    <meta property="og:locale" content="${book.language === "vi" ? "vi_VN" : "en_US"}">
    <meta property="og:site_name" content="${siteName}">
    <meta property="og:title" content="${escapeHtml(book.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(pageUrl)}">
    <meta property="og:image" content="${escapeHtml(socialImage)}">
    <meta property="og:image:secure_url" content="${escapeHtml(socialImage)}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(`${book.title} cover`)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(book.title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(socialImage)}">
    <meta name="twitter:image:alt" content="${escapeHtml(`${book.title} cover`)}">
    <meta name="theme-color" content="#233027">
    <link rel="icon" href="../../assets/icons/gnosis-favicon.svg?v=1" type="image/svg+xml">
    <link rel="stylesheet" href="../../styles.css?v=${appVersion}">
  </head>
  <body>
    <main class="share-landing">
      <img src="../../${escapeHtml(coverPath)}" alt="">
      <h1>${escapeHtml(book.title)}</h1>
      ${book.author ? `<p>${escapeHtml(book.author)}</p>` : ""}
      <a class="primary-button" href="${escapeHtml(appUrl)}">Nghe trên Sách nói Gnosis Hà Nội</a>
    </main>
  </body>
</html>
`;
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
fs.mkdirSync(booksRoot, { recursive: true });

for (const book of catalog.books || []) {
  const pageSlug = canonicalBookSlugs[book.id] || book.id;
  const folder = path.join(booksRoot, pageSlug);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "index.html"), htmlForBook(book));

  if (pageSlug !== book.id) {
    const legacyFolder = path.join(booksRoot, book.id);
    const canonicalUrl = absoluteSiteUrl(`books/${pageSlug}/`);
    fs.mkdirSync(legacyFolder, { recursive: true });
    fs.writeFileSync(path.join(legacyFolder, "index.html"), `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(book.title)} | ${siteName}</title>
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}">
  </head>
  <body>
    <p><a href="${escapeHtml(canonicalUrl)}">Mở trang sách ${escapeHtml(book.title)}</a></p>
  </body>
</html>
`);
  }
}
