const SHELL_CACHE = "gnosis-hanoi-shell-v4";
const AUDIO_CACHE = "gnosis-hanoi-offline-audio-v1";
const CATALOG_PATH = new URL("./data/catalog.json", self.registration.scope).pathname;
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=gnosis-editorial-45",
  "./app.js?v=gnosis-editorial-48",
  "./manifest.webmanifest",
  "./data/catalog.json",
  "./assets/branding/gnosis-hanoi-logo-transparent.png",
  "./assets/icons/gnosis-favicon.svg?v=2",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(SHELL_ASSETS.map(async (asset) => {
      try {
        await cache.add(asset);
      } catch (_) {
        // A non-critical asset must not prevent the listener from installing offline support.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith("gnosis-hanoi-shell-") && name !== SHELL_CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function rangedResponse(response, rangeHeader) {
  if (!rangeHeader || !response) return response;
  const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
  if (!match) return response;
  const bytes = await response.arrayBuffer();
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : bytes.byteLength - 1;
  const end = Math.min(requestedEnd, bytes.byteLength - 1);
  if (start > end || start >= bytes.byteLength) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${bytes.byteLength}` }
    });
  }
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${bytes.byteLength}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(bytes.slice(start, end + 1), { status: 206, headers });
}

async function audioResponse(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request.url);
  if (cached) return rangedResponse(cached, request.headers.get("range"));
  return fetch(request);
}

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put("./index.html", response.clone());
    return response;
  } catch (_) {
    const cache = await caches.open(SHELL_CACHE);
    return (await cache.match("./index.html")) || (await cache.match("./"));
  }
}

async function catalogResponse(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put("./data/catalog.json", response.clone());
    return response;
  } catch (_) {
    return cache.match("./data/catalog.json");
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.destination === "audio" || url.pathname.includes("/audio/")) {
    event.respondWith(audioResponse(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }
  if (url.pathname === CATALOG_PATH) {
    event.respondWith(catalogResponse(request));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && ["script", "style", "image", "font", "manifest"].includes(request.destination)) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
