const CACHE_NAME = 'easyx-v4';
const API_CACHE_NAME = 'easyx-api-v4';

// URLs para cache estático
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://customer-assets.emergentagent.com/job_product-compass-2/artifacts/anyq4exi_folha.png',
  'https://i.imgur.com/rJRL0ca.png',
  'https://i.imgur.com/lwNbD0G.png',
  'https://i.imgur.com/C1n0y7l.png',
  'https://i.imgur.com/xQOsNWd.png',
  'https://i.imgur.com/X1nSIwA.png',
  'https://i.imgur.com/Ev41QpU.png',
  'https://i.imgur.com/U3hgNcO.png'
];

// APIs ESSENCIAIS para funcionar offline
const coreApiEndpoints = [
  '/api/technologies',
  '/api/competitors/companies',
  '/api/home'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('📦 Caching static files...');
          return cache.addAll(urlsToCache);
        }),
      
      // Cache APIs essenciais
      caches.open(API_CACHE_NAME)
        .then((cache) => {
          console.log('🔄 Caching core APIs...');
          return Promise.all(
            coreApiEndpoints.map(url => 
              fetch(url)
                .then(response => response.ok ? cache.put(url, response.clone()) : null)
                .catch(err => console.log(`Failed to cache ${url}:`, err))
            )
          );
        })
    ])
    .then(() => {
      console.log('✅ Service Worker: Installation complete');
      self.skipWaiting();
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // OFFLINE-FIRST para funcionalidades core
  if (isCoreAPI(event.request)) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // NETWORK-FIRST para admin e materiais
  else if (isAdminAPI(event.request)) {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // CACHE-FIRST para assets estáticos
  else if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // DEFAULT: Network-first
  else {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Verificar se é API essencial
function isCoreAPI(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/technologies') ||
         url.pathname.startsWith('/api/competitors') ||
         url.pathname.startsWith('/api/products') ||
         url.pathname === '/api/home';
}

// Verificar se é API administrativa
function isAdminAPI(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/admin') ||
         url.pathname.startsWith('/api/auth');
}

// Verificar se é asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.ico');
}

// ESTRATÉGIA CACHE-FIRST
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📱 OFFLINE: Serving from cache -', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.log('❌ OFFLINE: Failed to serve -', request.url);
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Conecte-se à internet para carregar os dados.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ESTRATÉGIA NETWORK-FIRST
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && !isAdminAPI(request)) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('🔄 FALLBACK: Serving cached version -', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}
    Promise.all([
      // Cache estático
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(urlsToCache);
      }),
      // Cache de APIs
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Pre-caching API data');
        return Promise.all(
          apiUrlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response.clone());
                }
              })
              .catch(err => console.log('Failed to cache API:', url, err));
          })
        );
      })
    ])
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se online, atualizar cache e retornar resposta
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se offline, buscar no cache
          console.log('Service Worker: Serving from cache (offline):', request.url);
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Se não há cache, retornar dados offline básicos
            if (url.pathname === '/api/technologies') {
              return new Response(JSON.stringify([]), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            if (url.pathname === '/api/competitors/companies') {
              return new Response(JSON.stringify([]), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            if (url.pathname === '/api/home') {
              return new Response(JSON.stringify({
                text: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
                pdf_url: null
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            throw new Error('No cache available');
          });
        })
    );
    return;
  }

  // Estratégia para arquivos estáticos
  event.respondWith(
    caches.match(request).then((response) => {
      // Se está no cache, retornar
      if (response) {
        return response;
      }
      
      // Se não está no cache, buscar na rede
      return fetch(request).then((response) => {
        // Se resposta válida, adicionar ao cache
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Se offline e não há cache, retornar página offline básica
        if (request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados
      console.log('Performing background sync...')
    );
  }
});

// Notificações Push (para futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: 'https://i.imgur.com/rJRL0ca.png',
    badge: 'https://i.imgur.com/rJRL0ca.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('EasyX - MicroXisto', options)
  );
});

// Status da conectividade
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CLIENT_ID') {
    event.ports[0].postMessage({
      type: 'CLIENT_ID',
      clientId: event.source.id
    });
  }
});