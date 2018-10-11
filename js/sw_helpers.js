var db;
function getDB() {
    if (!db) {
        return idb.open('restaurants-db', 1).then(db => db);
    }
    return db;
}

function readRestaurantsFromDB() {
    return getDB().then(db => {
        var tx = db.transaction(['restaurants'], 'readonly');
        var store = tx.objectStore('restaurants');
        return store.getAll();
    });
}

function continueRequest(event) {
    try {
        event.respondWith(
            caches
                .match(event.request)
                .then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 404) {
                                return fetch('https://media.giphy.com/media/FrajBDPikVqBG/giphy.gif');
                            }
                            return response;
                        })
                        .catch(err => {
                            console.error(err);
                            return new Response('Resource request failed');
                        });
                })
                .catch(error => console.error('Error fetching', error))
        );
    } catch (error) {
        console.log(error);
    }
}

function processInternalRequest(requestUrl, event) {
    if (requestUrl.pathname === '/restaurant.html' && !isRestaurantDetails(requestUrl)) {
        return;
    }
    if (requestUrl.pathname === '/') {
        event.respondWith(caches.match('/'));
        return;
    }
    if (requestUrl.pathname.startsWith('/images/')) {
        event.respondWith(serveImage(event.request));
        return;
    }
    continueRequest(event);
}

function processInternalApiRequest() {
    return readRestaurantsFromDB()
        .then(function (restaurants) {
            if (restaurants && restaurants.length) {
                return restaurants;
            }
        })
        .catch(error => {
            console.error('Error getting restaurants from indexedDB: Detail error: ', error);
        });
}

const isRestaurantDetails = requestUrl => {
    const search = requestUrl.search;
    const urlWithQueryParams = search.match(/id=/g); // requestUrl.pathname == restaurant.html?id=5

    return !!urlWithQueryParams;
};

function serveImage(request) {
    const storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

    return caches.open(CACHE_POSTS_IMAGES).then(function (cache) {
        return cache.match(storageUrl).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(request)
                .then(function (networkResponse) {
                    cache.put(storageUrl, networkResponse.clone());
                    return networkResponse;
                })
                .catch(err => {
                    console.error(err);
                    return new Response('Resource photo request failed');
                });
        });
    });
}

const CACHE_NAME = 'mws-restaurant-stage-v1';
const CACHE_POSTS_IMAGES = 'mws-content-imgs';

const cacheWhitelist = [CACHE_POSTS_IMAGES, CACHE_NAME];

const urlsToCache = [
    '/',
    '/index.html',
    '/images/',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/js/assets/picture-polyfill.js',
    '/css/styles.css',
    '/css/queries.css',
    '/css/detail-queries.css',
    '/data/restaurants.json',
    '/js/idb/idb.js',
    'js/assets/material-components-web.min.js',
    'css/material-components-web.min.css',
    'js/assets/lazyload.min.js'
];