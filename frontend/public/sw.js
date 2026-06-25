// Service Worker - Auto-update quando online, offline quando sem rede
const CACHE_NAME = 'easyx-offline-v15';
const APP_VERSION = '3.5.0';

// INSTALAR - Ativa imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch('/').then(r => r.ok ? cache.put('/', r.clone()) : null).catch(() => {});
    })
  );
});

// ATIVAR - Limpa cache antigo e toma controle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    }).then(() => self.clients.claim()).then(() => {
      return self.clients.matchAll();
    }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', version: APP_VERSION }));
    })
  );
});

// FETCH - Network-first quando ONLINE, cache quando OFFLINE
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (!url.origin.includes(self.location.origin) || url.protocol === 'chrome-extension:') return;
  
  // Maintenance status - sempre rede
  if (url.pathname === '/api/maintenance-status') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Admin APIs - sempre rede
  if (url.pathname.startsWith('/api/admin') || url.pathname.startsWith('/api/auth') || 
      url.pathname.startsWith('/api/market-studies')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navegação (HTML) e assets JS/CSS - NETWORK FIRST
  if (event.request.mode === 'navigate' || url.pathname === '/' || 
      url.pathname.startsWith('/static/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') return getOfflinePage();
          throw new Error('Not available offline');
        });
      })
    );
    return;
  }

  // APIs offline (technologies, competitors, products, home) - network first com cache fallback
  if (url.pathname.startsWith('/api/technologies') || url.pathname.startsWith('/api/competitors') ||
      url.pathname.startsWith('/api/products') || url.pathname === '/api/home') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || new Response(JSON.stringify({ error: 'offline' }), {
            status: 503, headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Tudo mais - network first
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request).then(c => c || new Response('', { status: 503 })))
  );
});

// MESSAGE HANDLER
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DYNAMIC_DATA') {
    cacheEssentialData();
  }
});

async function cacheEssentialData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const urls = ['/api/technologies', '/api/competitors/companies', '/api/home'];
    for (const url of urls) {
      try {
        const r = await fetch(url);
        if (r.ok) await cache.put(url, r.clone());
      } catch (e) {}
    }
  } catch (e) {}
}

function getOfflinePage() {
  return new Response(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EasyX - Offline</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#006134,#83b942);color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px}.c{background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border-radius:16px;padding:40px 30px;max-width:400px;width:100%}h1{font-size:24px;margin:12px 0}p{font-size:16px;margin-bottom:24px;opacity:.9}button{background:#83b942;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;width:100%}</style></head><body><div class="c"><div style="font-size:48px">🌱</div><h1>EasyX MicroXisto</h1><p>Sem conexão. Conecte-se à internet.</p><button onclick="location.reload()">Tentar Reconectar</button></div><script>setInterval(()=>{if(navigator.onLine)location.reload()},3000)</script></body></html>`, {
    headers: { 'Content-Type': 'text/html' }
  });
}
