// 서비스워커: 설치 시 기존 캐시 제거 → 새로 캐시. fetch는 네트워크 우선, 실패 시 캐시 폴백.
const CACHE_NAME = 'quiz-cache-v2';
const FILES = [
  './index.html?v=5',
  './manifest.json?v=5',
  './icon-192.png?v=5',
  './icon-512.png?v=5'
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
  evt.respondWith(
    fetch(evt.request).then(resp => {
      // 성공하면 캐시에 업데이트(선택)
      if (evt.request.method === 'GET' && resp && resp.ok) {
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(evt.request, resp.clone()); } catch (e) { /* 일부 요청 실패 가능 */ }
        });
      }
      return resp;
    }).catch(() => caches.match(evt.request).then(m => m || Promise.reject('no-match')))
  );
});
