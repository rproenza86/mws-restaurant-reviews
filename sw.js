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
  '/js/picture-polyfill.js',
  '/css/styles.css',
  '/css/queries.css',
  '/css/detail-queries.css',
  '/data/restaurants.json',
  '/js/idb.js',
  'js/material-components-web.min.js',
  'css/material-components-web.min.css',
  'js/lazyload.min.js'
];

self.importScripts('/js/idb.js');

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

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Error installing', error))
  );
});

self.addEventListener('activate', event => {
  // white list examples
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('mws-') && cacheWhitelist.indexOf(cacheName) === -1; // Note that the "CACHE_NAME" is the name of the current cache
            })
            .map(cacheName => {
              return caches.delete(cacheName);
            })
        );
      })
      .catch(error => console.error('Error activating', error))
  );
});

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
    .then(function(restaurants) {
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

self.addEventListener('fetch', event => {
  // Let the browser do its default thing
  // for non-GET requests.
  if (event.request.method != 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (isRestaurantDetails(requestUrl)) {
    return;
  }

  if (requestUrl.origin === location.origin) {
    return processInternalRequest(requestUrl, event);
  } else {
    if (requestUrl.pathname.startsWith('/restaurants')) {
      return event.respondWith(
        (async function() {
          // Try to get the response from a cache.
          try {
            const cachedResponse = await processInternalApiRequest();
            // Return it if we found one.
            if (cachedResponse) {
              let response;
              const restaurantId = requestUrl.pathname.split('/')[2];
              if (restaurantId) {
                const foundRestaurantArray = cachedResponse.filter(
                  restaurant => restaurant.id == restaurantId
                );
                if (foundRestaurantArray.length) {
                  response = JSON.stringify(foundRestaurantArray[0]);
                } else {
                  return fetch(event.request);
                }
              } else {
                response = JSON.stringify(cachedResponse);
              }
              return new Response(response);
            } else {
              // If we didn't find a match in the cache, use the network.
              return fetch(event.request);
            }
          } catch (error) {
            console.error('Error fetching Api data: ', error);
          }
        })()
      );
    } else {
      return continueRequest(event);
    }
  }
});

self.addEventListener('message', event => {
  // Perform install steps
  if (event.data.action === 'skipWaiting') self.skipWaiting();
});

function serveImage(request) {
  const storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  return caches.open(CACHE_POSTS_IMAGES).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(request)
        .then(function(networkResponse) {
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
