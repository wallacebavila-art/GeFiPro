// Service Worker para cache de requisições Firebase
const CACHE_NAME = 'financas-cache-v1';
const FIREBASE_CACHE_NAME = 'financas-firebase-v1';

// URLs para pré-cache (arquivos estáticos)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
  '/logo.png',
];

// Instalação - pré-cache dos assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache de assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instalação completa');
        return self.skipWaiting();
      })
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== FIREBASE_CACHE_NAME) {
            console.log('[SW] Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Ativação completa');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Verificar se é requisição Firebase
  const isFirebaseRequest = url.hostname.includes('firebaseio.com');
  
  if (isFirebaseRequest) {
    // Estratégia: Cache First, then Network para Firebase
    event.respondWith(
      caches.open(FIREBASE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Retornar do cache imediatamente se existir
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              // Atualizar cache com dados frescos
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.log('[SW] Erro na rede, usando cache:', error);
            // Se falhar na rede, retornar cache ou erro
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Offline e sem cache' }),
              { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
              }
            );
          });
          
          // Retornar cache se existir, senão aguardar rede
          return cachedResponse || fetchPromise;
        });
      })
    );
  } else {
    // Requisições normais: Cache First
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

// Mensagens do cliente (app)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
