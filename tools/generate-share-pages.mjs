import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(siteRoot, "data", "catalog.json");
const booksRoot = path.join(siteRoot, "books");
const siteUrl = "https://audio.gnosishanoi.org/";
const siteName = "Sách nói Gnosis Hà Nội";
const appVersion = "gnosis-chapter-share-49";

const canonicalBookSlugs = {
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "tam-ly-hoc-cho-su-thay-doi-triet-de",
  "xu-xo-cua-cac-vi-than": "xu-so-cua-cac-vi-than"
};

const knownCoverPaths = {
  "dayspring-of-youth": "assets/covers/dayspring-of-youth-gnosis-v2.png?v=2",
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "assets/covers/tam-ly-hoc-cho-su-thay-doi-triet-de-gnosis-v4.png?v=4",
  "xu-xo-cua-cac-vi-than": "assets/covers/xu-xo-cua-cac-vi-than-gnosis-v5.png?v=5",
  "bien-chung-tam-thuc": "assets/covers/bien-chung-tam-thuc-gnosis-v3.png?v=3",
  "hon-nhan-hoan-hao": "assets/covers/hon-nhan-hoan-hao-v2-smooth.png?v=1"
};

const descriptionFallbacks = {
  "dayspring-of-youth": "A contemplative study of subtle nature, inner life, and the awakening of human consciousness.",
  "tam-ly-hoc-cho-su-thay-oi-triet-e": "Những bài giảng về quan sát bản thân, chuyển hóa tâm lý và đánh thức ý thức.",
  "xu-xo-cua-cac-vi-than": "Tác phẩm của Franz Hartmann về cuộc diện kiến các Chân sư Minh triết ở Shambhala.",
  "bien-chung-tam-thuc": "Tác phẩm về thiền, tâm lý học và huyền học, trình bày phương pháp làm tan rã cái tôi, vượt qua những đối nghịch của tư tưởng và rèn luyện tâm thức.",
  "hon-nhan-hoan-hao": "Những nguyên lý Gnosis về tình yêu, hôn nhân và sự chuyển hóa năng lượng sáng tạo."
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

function htmlForBook(book, chapterIndex = null) {
  const chapter = chapterIndex === null ? null : book.chapters[chapterIndex];
  const displayTitle = chapter ? `${chapter.title} · ${book.title}` : book.title;
  const depth = chapter ? "../../../../" : "../../";
  const title = `${displayTitle} | ${siteName}`;
  const description = bookDescription(book);
  const credits = [
    book.author ? `<p>${escapeHtml(book.author)}</p>` : "",
    book.publisher ? `<p>Nhà xuất bản: ${escapeHtml(book.publisher)}</p>` : ""
  ].filter(Boolean).join("\n      ");
  const coverPath = normalizeAsset(book.cover, book.id);
  const socialImagePath = `assets/social/${book.id}-share-v2.jpg`;
  const mime = "image/jpeg";
  const dimensions = '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">';
  const socialImage = absoluteSiteUrl(socialImagePath);
  const pageSlug = canonicalBookSlugs[book.id] || book.id;
  const pageUrl = absoluteSiteUrl(`books/${pageSlug}/${chapter ? `chapters/${chapterIndex + 1}/` : ""}`);
  const appUrl = absoluteSiteUrl(`#book/${pageSlug}${chapter ? `?chapter=${chapterIndex + 1}` : ""}`);

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
    <meta property="og:title" content="${escapeHtml(displayTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(pageUrl)}?share=playlist-v3">
    <meta property="og:image" content="${escapeHtml(socialImage)}">
    <meta property="og:image:secure_url" content="${escapeHtml(socialImage)}">
    <meta property="og:image:type" content="${mime}">
    ${dimensions}
    <meta property="og:image:alt" content="${escapeHtml(`${book.title} cover`)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(displayTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(socialImage)}">
    <meta name="twitter:image:alt" content="${escapeHtml(`${book.title} cover`)}">
    <meta name="theme-color" content="#233027">
    <link rel="icon" href="${depth}assets/icons/gnosis-favicon.svg?v=2" type="image/svg+xml">
    <link rel="stylesheet" href="${depth}styles.css?v=${appVersion}">
  </head>
  <body>
    <script>window.location.replace(${JSON.stringify(appUrl).replace(/</g, "\\u003c")});</script>
    <main class="share-landing">
      <img src="${depth}${escapeHtml(coverPath)}" alt="${escapeHtml(book.title)}">
      <h1>${escapeHtml(displayTitle)}</h1>
      ${credits}
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

  for (const [index] of (book.chapters || []).entries()) {
    const chapterFolder = path.join(folder, "chapters", String(index + 1));
    fs.mkdirSync(chapterFolder, {recursive: true});
    fs.writeFileSync(path.join(chapterFolder, "index.html"), htmlForBook(book, index));
  }

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
