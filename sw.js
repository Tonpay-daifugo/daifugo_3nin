const CACHE_PREFIX = "daifugo-3nin-cache-";
const CACHE_NAME = CACHE_PREFIX + "saishin";
// バージョンを更新するたびに名前を変えること！

const FILES_TO_CACHE = [
  "./",
  "./index.html",
//  "./manifest.json",　これをキャッシュさせると更新した時にandroidでうまくいかないことがある
  "./icon-3nin-192.png",
  "./icon-3nin-512.png"
];

// インストール時に必要なファイルをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 新しいService Workerが有効になったとき、古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) => {
        return Promise.all(
          names
            .filter(
              (name) =>
                name.startsWith(CACHE_PREFIX) &&
                name !== CACHE_NAME
            )
            .map((name) => caches.delete(name))
        );
      }),
      self.clients.claim()
    ])
  );
});

// キャッシュがあればキャッシュを使用
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

  if (event.request.mode === "navigate") {
    return fetch(event.request).catch(() => {
      return caches.match("./index.html");
    });
  }

      return fetch(event.request);
    })
  );
});