const CACHE_NAME = 'mws-restaurant-stage-v1';
const CACHE_POSTS_IMAGES = 'mws-content-imgs';

const cacheWhitelist = [CACHE_POSTS_IMAGES, CACHE_NAME];

const urlsToCache = [
    '/',
    '/images/',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'js/picture-polyfill.js',
    'css/styles.css',
    'css/queries.css',
    'data/restaurants.json'
];

self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.info('Opened cache');
            return cache.addAll(urlsToCache);
        })
        .catch(error => console.error('Error installing', error))
    );
});

self.addEventListener('activate', event => {
    // white list examples
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('mws-') && cacheWhitelist.indexOf(cacheName) === -1; // Note that the "CACHE_NAME" is the name of the current cache
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
        .catch(error => console.error('Error activating', error))
    );
});

self.addEventListener('fetch', event => {
    // Let the browser do its default thing
    // for non-GET requests.
    if (event.request.method != 'GET') return;

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
            event.respondWith(caches.match('/'));
            return;
        }
        if (requestUrl.pathname.startsWith('/images/')) {
            event.respondWith(serveImage(event.request));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request).then(response => {
                if (response.status === 404) {
                    return fetch('https://media.giphy.com/media/FrajBDPikVqBG/giphy.gif');
                }
                return response;
            }).catch(err => {
                console.error(err);
                return new Response("Resource request failed");
            });
        })
        .catch(error => console.error('Error fetching', error))
    );
});

self.addEventListener('message', event => {
    // Perform install steps
    if (event.data.action === 'skipWaiting')
        self.skipWaiting();
});

function serveImage(request) {
    const storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

    return caches.open(CACHE_POSTS_IMAGES).then(function(cache) {
        return cache.match(storageUrl)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(request).then(function(networkResponse) {
                    console.info('Opened photos cache');
                    cache.put(storageUrl, networkResponse.clone());
                    return networkResponse;
                }).catch(err => {
                    console.error(err);
                    return new Response("Resource photo request failed");
                });
            });
    });
}