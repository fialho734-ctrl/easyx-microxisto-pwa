// Service Worker SIMPLES E FUNCIONAL para funcionar OFFLINE
const CACHE_NAME = 'easyx-offline-v8';
const APP_VERSION = '2.2.0'; // Versão com comparação rápida + domínio customizado

// INSTALAR - Cache TUDO que é essencial
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Installing v7 (App v' + APP_VERSION + ')...');
  
  // Pular waiting imediatamente para atualizar mais rápido
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching essential files...');
        
        // Cache a página principal primeiro
        return fetch('/')
          .then(response => {
            if (response.ok) {
              return cache.put('/', response.clone());
            }
          })
          .catch(err => console.log('Failed to cache main page'));
      })
      .then(() => {
        console.log('✅ SW: Install complete');
        // Notificar todos os clientes sobre nova versão
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NEW_VERSION_AVAILABLE',
              version: APP_VERSION
            });
          });
        });
      })
      .catch(error => {
        console.error('❌ SW: Install failed:', error);
      })
  );
});

// ATIVAR - Limpar cache antigo e assumir controle
self.addEventListener('activate', (event) => {
  console.log('⚡ SW: Activating v7 (App v' + APP_VERSION + ')...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ SW: Activated, claiming clients');
        return self.clients.claim();
      })
      .then(() => {
        // Notificar todos os clientes sobre ativação
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: APP_VERSION
          });
        });
      })
  );
});

// FETCH - Estratégia ULTRA SIMPLES
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requests externos e chrome-extension
  if (!url.origin.includes(self.location.origin) || 
      url.protocol === 'chrome-extension:') {
    return;
  }
  
  console.log('🔍 SW: Handling request:', url.pathname);
  
  event.respondWith(
    handleRequest(event.request)
  );
});

// HANDLE REQUEST - Cache inteligente
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Para navegação (HTML), sempre tentar cache primeiro
    if (request.mode === 'navigate' || url.pathname === '/') {
      return await handleNavigation(request);
    }
    
    // Para APIs que devem funcionar offline
    if (isOfflineAPI(url)) {
      return await handleOfflineAPI(request);
    }
    
    // Para assets estáticos
    if (isStaticAsset(url)) {
      return await handleStaticAsset(request);
    }
    
    // Para admin (sempre rede)
    if (isAdminAPI(url)) {
      return await fetch(request);
    }
    
    // Default: rede com fallback cache
    return await networkWithCacheFallback(request);
    
  } catch (error) {
    console.log('❌ SW: Request failed:', url.pathname, error);
    
    // Fallback final
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Se é navegação e falhou, retorna página offline
    if (request.mode === 'navigate') {
      return getOfflinePage();
    }
    
    throw error;
  }
}

// NAVEGAÇÃO - HTML principal
async function handleNavigation(request) {
  console.log('🏠 SW: Handling navigation');
  
  // Primeiro tenta cache
  const cached = await caches.match('/');
  if (cached) {
    console.log('📱 SW: Serving cached HTML');
    
    // Background update se online
    if (navigator.onLine) {
      updateCacheInBackground('/');
    }
    
    return cached;
  }
  
  // Se não tem cache, busca na rede
  try {
    const response = await fetch('/');
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/', response.clone());
      console.log('🌐 SW: Cached new HTML');
      return response;
    }
  } catch (error) {
    console.log('❌ SW: Network failed for HTML');
  }
  
  // Fallback: página offline
  return getOfflinePage();
}

// OFFLINE APIs - Tecnologias, Concorrentes
async function handleOfflineAPI(request) {
  const url = new URL(request.url);
  console.log('🔄 SW: Handling offline API:', url.pathname);
  
  // Cache first para APIs offline
  const cached = await caches.match(request);
  if (cached) {
    console.log('📱 SW: API from cache');
    
    // Background sync se online
    if (navigator.onLine) {
      updateCacheInBackground(request.url);
    }
    
    return cached;
  }
  
  // Buscar na rede se não tem cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      console.log('🌐 SW: API cached from network');
      return response;
    }
  } catch (error) {
    console.log('❌ SW: API network failed');
  }
  
  // Sem cache e sem rede - erro JSON
  return new Response(JSON.stringify({
    error: 'offline',
    message: 'Dados não disponíveis offline. Conecte-se à internet.'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// STATIC ASSETS - JS, CSS, imagens
async function handleStaticAsset(request) {
  console.log('📁 SW: Handling static asset');
  
  // Cache first para assets
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  // Buscar na rede
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('❌ SW: Static asset failed');
  }
  
  throw new Error('Asset not available');
}

// NETWORK + CACHE FALLBACK
async function networkWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    
    // Cache se sucesso
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
    
  } catch (error) {
    // Fallback para cache
    const cached = await caches.match(request);
    if (cached) {
      console.log('🔄 SW: Using cache fallback');
      return cached;
    }
    
    throw error;
  }
}

// CHECKERS - Identificar tipo de request
function isOfflineAPI(url) {
  return url.pathname.startsWith('/api/technologies') ||
         url.pathname.startsWith('/api/competitors') ||
         url.pathname.startsWith('/api/products') ||
         url.pathname === '/api/home';
}

function isAdminAPI(url) {
  return url.pathname.startsWith('/api/admin') ||
         url.pathname.startsWith('/api/auth');
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.json') ||
         url.pathname.includes('imgur.com') ||
         url.pathname.includes('customer-assets');
}

// BACKGROUND UPDATE
async function updateCacheInBackground(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response.clone());
      console.log('🔄 SW: Background cache updated');
    }
  } catch (error) {
    // Silent fail para background update
  }
}

// PÁGINA OFFLINE básica
function getOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>EasyX - Offline</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #006134, #83b942);
          color: white;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }
        .offline-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 40px 30px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .logo { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 24px; margin-bottom: 12px; font-weight: 600; }
        p { font-size: 16px; margin-bottom: 24px; opacity: 0.9; line-height: 1.4; }
        .retry-btn {
          background: #83b942;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        .retry-btn:hover { background: #6fa136; }
        .status { 
          margin-top: 20px; 
          font-size: 14px; 
          opacity: 0.8; 
        }
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="logo">🌱</div>
        <h1>EasyX MicroXisto</h1>
        <p>App funcionando offline.<br>Conecte-se à internet para sincronizar dados.</p>
        <button class="retry-btn" onclick="location.reload()">
          🔄 Tentar Reconectar
        </button>
        <div class="status" id="status">
          <div class="spinner"></div>
          Verificando conexão...
        </div>
      </div>
      
      <script>
        // Check connection periodically
        function checkConnection() {
          if (navigator.onLine) {
            document.getElementById('status').innerHTML = '🟢 Online - Recarregando...';
            setTimeout(() => location.reload(), 1000);
          } else {
            document.getElementById('status').innerHTML = '🔴 Offline - Aguardando conexão...';
          }
        }
        
        setInterval(checkConnection, 2000);
        checkConnection();
        
        window.addEventListener('online', checkConnection);
        window.addEventListener('offline', checkConnection);
      </script>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// MESSAGE HANDLER - Cache dinâmico
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DYNAMIC_DATA') {
    cacheEssentialData();
  }
});

// CACHE dados essenciais
async function cacheEssentialData() {
  console.log('🔄 SW: Starting essential data cache...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const urlsToCache = [
      '/api/technologies',
      '/api/competitors/companies',
      '/api/home'
    ];
    
    for (const url of urlsToCache) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
          console.log(`✅ SW: Cached ${url}`);
        }
      } catch (err) {
        console.log(`❌ SW: Failed to cache ${url}`);
      }
    }
    
    // Cache produtos das tecnologias
    try {
      const techResponse = await fetch('/api/technologies');
      if (techResponse.ok) {
        const technologies = await techResponse.json();
        
        for (const tech of technologies.slice(0, 5)) { // Primeiras 5
          try {
            const productsUrl = `/api/technologies/${tech.id}/products`;
            const productsResponse = await fetch(productsUrl);
            if (productsResponse.ok) {
              await cache.put(productsUrl, productsResponse.clone());
              console.log(`✅ SW: Cached products for ${tech.name}`);
            }
          } catch (err) {
            console.log(`❌ SW: Failed to cache products for ${tech.name}`);
          }
        }
      }
    } catch (err) {
      console.log('❌ SW: Failed to cache technology products');
    }
    
    console.log('✅ SW: Essential data caching completed');
    
  } catch (error) {
    console.log('❌ SW: Essential data caching failed:', error);
  }
}