self.importScripts('/js/idb/idb.js');
self.importScripts('/js/sw_helpers.js');

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