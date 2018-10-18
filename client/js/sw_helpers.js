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

function getRequestToMatch(event) {
    const requestUrl = new URL(event.request.url);
    if (isRestaurantDetails(requestUrl)) {
        return new Request( requestUrl.origin + requestUrl.pathname);
    }
    return event.request;
}

function continueRequest(event) {
    try {
        event.respondWith(caches
            .match(getRequestToMatch(event))
            .then(function(response) {
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
            .catch(error => console.error('Error fetching', error)));
    } catch (error) {
        console.log(error, event.request);
    }
}

function processInternalRequest(requestUrl, event) {
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
