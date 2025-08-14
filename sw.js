const CACHE_NAME = 'quiz-cache-v12';
const FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sw.js',

  // 문제에서 쓰이는 모든 이미지
  './1.png',
  './2.png',
  './3.png',
  './4.png',
  './5.png',
  './6.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  // 쿼리스트링 제거해서 캐시 매치
  let url = new URL(evt.request.url);
  url.search = '';
  const reqNoQuery = new Request(url, { method: evt.request.method, headers: evt.request.headers });

  evt.respondWith(
    fetch(evt.request).then(resp => {
      if (evt.request.method === 'GET' && resp.ok) {
        caches.open(CACHE_NAME).then(cache => cache.put(reqNoQuery, resp.clone()));
      }
      return resp;
    }).catch(() => caches.match(reqNoQuery).then(m => m || Promise.reject('no-match')))
  );
});
