const CACHE_NAME = 'easyx-v4';
const API_CACHE_NAME = 'easyx-api-v4';

// URLs para cache estático ESSENCIAIS
const urlsToCache = [
  '/',
  '/index.html',
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

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(urlsToCache);
      })
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

// Interceptar requisições com estratégia inteligente
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // APIs essenciais (OFFLINE-FIRST)
  if (isCoreAPI(url)) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // APIs administrativas (NETWORK-ONLY)
  else if (isAdminAPI(url)) {
    event.respondWith(networkOnlyStrategy(event.request));
  }
  // Assets estáticos (CACHE-FIRST)
  else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // Outros (NETWORK-FIRST com fallback)
  else {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Verificar se é API essencial (deve funcionar offline)
function isCoreAPI(url) {
  return url.pathname.startsWith('/api/technologies') ||
         url.pathname.startsWith('/api/competitors') ||
         url.pathname.startsWith('/api/products') ||
         url.pathname === '/api/home';
}

// Verificar se é API administrativa
function isAdminAPI(url) {
  return url.pathname.startsWith('/api/admin') ||
         url.pathname.startsWith('/api/auth');
}

// Verificar se é asset estático
function isStaticAsset(url) {
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.json');
}

// CACHE-FIRST: Prioriza cache (para funcionar offline)
async function cacheFirstStrategy(request) {
  try {
    // Primeiro tenta buscar no cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📱 CACHE: Serving from cache -', request.url);
      
      // Atualiza cache em background se estiver online
      if (navigator.onLine) {
        backgroundUpdate(request);
      }
      
      return cachedResponse;
    }

    // Se não tem cache, busca na rede e armazena
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('🌐 NETWORK: Cached new data -', request.url);
    }
    return networkResponse;
    
  } catch (error) {
    console.log('❌ OFFLINE: Request failed -', request.url);
    
    // Retorna erro JSON amigável
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Esta funcionalidade requer conexão com a internet.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// NETWORK-FIRST: Prioriza rede com fallback para cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache response se for sucesso
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Fallback para cache se disponível
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('🔄 FALLBACK: Using cached version -', request.url);
      return cachedResponse;
    }
    
    // Se não tem cache, retorna erro
    return new Response('Offline', { status: 503 });
  }
}

// NETWORK-ONLY: Sempre da rede (para admin)
async function networkOnlyStrategy(request) {
  return fetch(request);
}

// Atualização em background
async function backgroundUpdate(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, response.clone());
      console.log('🔄 BACKGROUND: Updated cache -', request.url);
    }
  } catch (error) {
    // Silenciosamente ignora erros de background update
  }
}

// Message handler para cache dinâmico
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DYNAMIC_DATA') {
    cacheDynamicData();
  }
});

// Cache dados dinâmicos (produtos por tecnologia, concorrentes)
async function cacheDynamicData() {
  try {
    console.log('🔄 Starting dynamic data caching...');
    const cache = await caches.open(API_CACHE_NAME);
    
    // Cache tecnologias
    const techResponse = await fetch('/api/technologies');
    if (techResponse.ok) {
      await cache.put('/api/technologies', techResponse.clone());
      const technologies = await techResponse.json();
      
      // Cache produtos de cada tecnologia
      for (const tech of technologies) {
        try {
          const productsUrl = `/api/technologies/${tech.id}/products`;
          const productsResponse = await fetch(productsUrl);
          if (productsResponse.ok) {
            await cache.put(productsUrl, productsResponse.clone());
            console.log(`📦 Cached: ${tech.name} products`);
          }
        } catch (err) {
          console.log(`❌ Failed to cache: ${tech.name} products`);
        }
      }
    }
    
    // Cache empresas concorrentes
    const companiesResponse = await fetch('/api/competitors/companies');
    if (companiesResponse.ok) {
      await cache.put('/api/competitors/companies', companiesResponse.clone());
      const companies = await companiesResponse.json();
      
      // Cache produtos das principais empresas
      const mainCompanies = companies.slice(0, 10); // Top 10
      for (const company of mainCompanies) {
        try {
          const companyProductsUrl = `/api/competitors/companies/${encodeURIComponent(company.company)}/products`;
          const companyResponse = await fetch(companyProductsUrl);
          if (companyResponse.ok) {
            await cache.put(companyProductsUrl, companyResponse.clone());
            console.log(`📦 Cached: ${company.company} products`);
          }
        } catch (err) {
          console.log(`❌ Failed to cache: ${company.company} products`);
        }
      }
    }
    
    // Cache home content
    const homeResponse = await fetch('/api/home');
    if (homeResponse.ok) {
      await cache.put('/api/home', homeResponse.clone());
    }
    
    console.log('✅ Dynamic data caching completed!');
    
  } catch (error) {
    console.log('❌ Dynamic caching failed:', error);
  }
}