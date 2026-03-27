const CACHE_NAME = 'leitor-livro-v1';

// Arquivos base para carregar a interface (O PDF será salvo automaticamente depois)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// Interceptação de rede (Modo Offline)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Se o arquivo já está no cache, retorna ele. Senão, baixa da internet.
                return cachedResponse || fetch(event.request).then((response) => {
                    // Salva novos arquivos no cache (como o PDF do livro) para leitura offline futura
                    return caches.open(CACHE_NAME).then((cache) => {
                        if (event.request.method === 'GET' && response.status === 200) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    });
                });
            })
    );
});

// Atualização e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
