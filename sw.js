const CACHE_NAME = 'real-estate-offline-v72'; // تم رفع الإصدار لتحديث الكاش ومسح النسخة القديمة
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-storage-compat.js'
];

self.addEventListener('install', event => { 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  ); 
  self.skipWaiting(); 
});

self.addEventListener('activate', event => { 
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { 
        if (key !== CACHE_NAME) return caches.delete(key); 
      })
    )).then(() => self.clients.claim())
  ); 
});

self.addEventListener('fetch', event => { 
  // استثناء طلبات Firebase وقواعد البيانات والطلبات غير العادية من الكاش
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('firebaseio.com') || 
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('firebasestorage.app')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  ); 
});
