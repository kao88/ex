const CACHE_NAME = "quiz-app-v1";
const urlsToCache = [
    "indexa.html",
    "style.css",
    "script.js",
    "db.txt",
    "sql-wasm.wasm",
    "sqlite.worker.js",
    "manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});