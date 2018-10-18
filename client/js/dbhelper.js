/**
 * Common database helper functions.
 */

/**
 * indexedDB access point
 */
const dbPromise = idb
  ? idb.open('restaurants-db', 1, function(upgradeDb) {
      // 1- Open a database.
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants', { keyPath: 'name' });
        case 1:
          let restaurantsStore = upgradeDb.transaction.objectStore('restaurants');
          restaurantsStore.createIndex('by-id', 'id'); // index creation to queryfy the idb people table by restaurantId
        case 2:
          upgradeDb.createObjectStore('review_queue', { keyPath: 'name' }); // queue to store review  submitted offline
        case 3:
          let reviewStore = upgradeDb.transaction.objectStore('review_queue');
          reviewStore.createIndex('by-id', 'restaurant_id');
        case 4:
          upgradeDb.createObjectStore('restaurants_reviews', {
            keyPath: 'restaurant_id'
          }); // restaurant reviews
        case 5:
          let reviewsStore = upgradeDb.transaction.objectStore('restaurants_reviews');
          reviewsStore.createIndex('by-id', 'restaurant_id');
      }
    })
  : null;

class DBHelper {
  /**
   * Database URL.
   */
  static get API_SERVER_URL() {
    // const port = 1337; // Change this to your server port
    // const url = document.domain === '127.0.0.1' || document.domain === 'localhost' ? `https://168.61.212.255` : `${window.location.protocol}//${document.domain}`;
    const url =
      document.domain === '127.0.0.1' || document.domain === 'localhost'
        ? 'http://localhost:5001/roca-bws/us-central1'
        : 'https://us-central1-roca-bws.cloudfunctions.net';
    return url;
  }
  /**
   * Get list of cached restaurants
   */
  static showCachedRestaurants() {
    return dbPromise.then(function(db) {
      const idIndex = db
        .transaction('restaurants')
        .objectStore('restaurants')
        .index('by-id');

      return idIndex.getAll();
    });
  }
  /**
   * Get list of cached reviews enqueued because app was offline, when online will all the queue will be resubmitted
   */
  static getEnqueueReviews() {
    return dbPromise.then(function(db) {
      const idIndex = db
        .transaction('review_queue')
        .objectStore('review_queue')
        .index('by-id');

      return idIndex.getAll();
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const url = DBHelper.API_SERVER_URL;
    fetch(`${url}/restaurants`)
      .then(function(response) {
        if (response.ok) {
          response.json().then(restaurants => {
            if (restaurants.length && dbPromise) {
              // Deleting invalid records
              for (const restaurantIndex in restaurants) {
                if (!restaurants[restaurantIndex].name) {
                  restaurants.splice(restaurantIndex, 1);
                }
              }
              window.restaurants = restaurants;
              callback(null, restaurants);
              dbPromise
                .then(function(db) {
                  const tx = db.transaction('restaurants', 'readwrite');
                  const restaurantsStore = tx.objectStore('restaurants');

                  for (const restaurant of restaurants) {
                    restaurantsStore.put(restaurant);
                  }

                  return tx.complete;
                })
                .then(function() {
                  console.log('Restaurants added to browser db.');
                });

              for (const restaurant of restaurants) {
                DBHelper.fetchRestaurantReviewById(restaurant.id, () => {});
              }
            }
          });
        } else {
          throw new Error(`Request failed  fetching restaurants. Returned status of ${xhr.status}`);
        }
      })
      .catch(function(error) {
        return callback(error, null);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    const url = DBHelper.API_SERVER_URL;
    fetch(`${url}/restaurants/${id}`)
      .then(function(response) {
        if (response.ok) {
          response.json().then(restaurant => callback(null, restaurant));
        } else {
          throw new Error('Restaurant does not exist');
        }
      })
      .catch(function(error) {
        return callback(error, null);
      });
  }

  /**
   * Fetch a restaurant reviews by its ID.
   */
  static fetchRestaurantReviewById(id, callback) {
    // fetch all restaurants with proper error handling.
    const url = DBHelper.API_SERVER_URL;
    fetch(`${url}/reviews?restaurant_id=${id}`)
      .then(function(response) {
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') !== -1) {
            response.json().then(reviews => {
              DBHelper.saveRestaurantReviewsOnLocalDB(id, reviews);
              callback(null, reviews);
            });
          } else {
            DBHelper.getRestaurantsReviewsFromLocalDB().then(reviewsList => {
              for (restaurant of reviewsList) {
                if (restaurant.restaurant_id == id) {
                  return callback(null, restaurant.reviews);
                }
              }
            });
          }
        } else {
          throw new Error('Restaurant does not have reviews');
        }
      })
      .catch(function(error) {
        return callback(error, null);
      });
  }
  /**
   * Send a restaurant review form data  to the server.
   */
  static saveReview(callback, formData = null) {
    let FD;
    let payload;
    if (!formData) {
      // Bind the FormData object and the form element
      FD = new FormData(shippingForm);

      const id = getParameterByName('id') || window.localStorage.getItem('restaurantId');
      FD.append('restaurant_id', id);
    } else {
      FD = DBHelper.generateFormData(formData);
    }

    payload = { restaurant_id: FD.get('restaurant_id'), name: FD.get('name'), rating: FD.get('rating'), comments: FD.get('comments') };

    fetch(`${DBHelper.API_SERVER_URL}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      }
    })
      .then(response => response.json())
      .then(response => {
        console.log('Success creating review:', response);
        callback(payload);
        shippingForm.reset();
        if (formData) {
          DBHelper.deleteReviewFromLocalDB(response);
        }
      })
      .catch(error => {
        console.error('Oops! Something went wrong. Error:', error);

        const formData = { restaurant_id: null, name: '', data: [] };
        const fakeResponse = {};

        for (const value of FD.entries()) {
          formData.data.push(value);

          if (value[0] === 'restaurant_id') {
            formData.restaurant_id =
              value[1] !== 'null' ? value[1] : window.localStorage.getItem('restaurantId');
          }

          if (value[0] === 'name') {
            formData.name = value[1];
          }

          fakeResponse[value[0]] = value[1];
        }

        DBHelper.saveReviewForRetry(formData);

        callback(fakeResponse);
        shippingForm.reset();
      });
  }

  static generateFormData(formData) {
    const FD = new FormData();

    formData.data.forEach(data => {
      const [formField, fieldData] = data;
      FD.append(formField, fieldData);
    });

    return FD;
  }

  static deleteReviewFromLocalDB(review) {
    dbPromise
      .then(function(db) {
        const tx = db.transaction('review_queue', 'readwrite');
        const reviewIndex = tx.objectStore('review_queue');

        return reviewIndex.openCursor();
      })
      .then(function deleteLocalStoredReview(cursor) {
        if (!cursor) return; // Empty case
        if (
          cursor.value.name === review.name &&
          cursor.value.restaurant_id === review.restaurant_id
        ) {
          cursor.delete();
        }

        return cursor.continue().then(deleteLocalStoredReview);
      })
      .then(function() {
        console.log('Done deleting review: ', review);
      });
  }

  static saveReviewForRetry(review) {
    dbPromise &&
      dbPromise
        .then(function(db) {
          const tx = db.transaction('review_queue', 'readwrite');
          const reviewStore = tx.objectStore('review_queue');

          reviewStore.put(review);
          return tx.complete;
        })
        .then(function() {
          console.log('Review added to browser db.');
        });
  }
  /**
   * Local save of review by restaurant_id for offline support
   * @param {*} restaurant_id
   * @param {*} reviewsList
   */
  static saveRestaurantReviewsOnLocalDB(restaurant_id, reviewsList) {
    dbPromise &&
      dbPromise
        .then(function(db) {
          const tx = db.transaction('restaurants_reviews', 'readwrite');
          const reviewStore = tx.objectStore('restaurants_reviews');
          const reviews = {
            restaurant_id: restaurant_id,
            reviews: reviewsList
          };

          reviewStore.put(reviews);
          return tx.complete;
        })
        .then(function() {
          // console.log(`Restaurant ${restaurant_id}Reviews added to browser idb.`);
        });
  }
  /**
   * Get list of cached  restaurants reviews
   */
  static getRestaurantsReviewsFromLocalDB() {
    return dbPromise.then(function(db) {
      const idIndex = db
        .transaction('restaurants_reviews')
        .objectStore('restaurants_reviews')
        .index('by-id');

      return idIndex.getAll();
    });
  }

  static processReviewQueue() {
    DBHelper.getEnqueueReviews().then(queue => {
      queue.map(formData => {
        DBHelper.saveReview(() => {}, formData);
      });
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}`;
  }

  /**
   * Restaurant responsive image html element.
   */
  static createResponsiveImageElm(restaurant) {
    const photograph = restaurant.photograph && restaurant.photograph.split('.')[0];
    const picture = document.createElement('picture');

    const sourceWebp1 = document.createElement('source');
    sourceWebp1.sizes = '80vw';
    sourceWebp1.media = '(max-width: 350px)';
    sourceWebp1.setAttribute('data-srcset', `/images/webp/30/${photograph}.webp`);
    sourceWebp1.type = 'image/webp';
    picture.append(sourceWebp1);

    const sourceWebp2 = document.createElement('source');
    sourceWebp2.sizes = '80vw';
    sourceWebp2.media = '(max-width: 800px)';
    sourceWebp2.setAttribute('data-srcset', `/images/webp/50/${photograph}.webp`);
    sourceWebp2.type = 'image/webp';
    picture.append(sourceWebp2);

    const sourceWebp3 = document.createElement('source');
    sourceWebp3.sizes = '80vw';
    sourceWebp3.media = '(max-width: 2400px)';
    sourceWebp3.setAttribute('data-srcset', `/images/webp/70/${photograph}.webp`);
    sourceWebp3.type = 'image/webp';
    picture.append(sourceWebp3);

    const sourceJpgSmall = document.createElement('source');
    sourceJpgSmall.sizes = '80vw';
    sourceJpgSmall.media = '(max-width: 350px)';
    sourceJpgSmall.setAttribute('data-srcset', `/images/small/${photograph}-350_small_1x.jpg 1x`);
    sourceJpgSmall.type = 'image/jpeg';
    picture.append(sourceJpgSmall);

    const sourceJpgSmall2x = document.createElement('source');
    sourceJpgSmall2x.sizes = '80vw';
    sourceJpgSmall2x.media = '(max-width: 500px)';
    sourceJpgSmall2x.setAttribute('data-srcset', `/images/small/${photograph}-500_small_2x.jpg 2x`);
    sourceJpgSmall2x.type = 'image/jpeg';
    picture.append(sourceJpgSmall2x);

    const sourceJpgMedium = document.createElement('source');
    sourceJpgMedium.sizes = '80vw';
    sourceJpgMedium.media = '(max-width: 1399px)';
    sourceJpgMedium.setAttribute(
      'data-srcset',
      `/images/medium/${photograph}-800_medium_1x.jpg 1x`
    );
    sourceJpgMedium.type = 'image/jpeg';
    picture.append(sourceJpgMedium);

    const sourceJpgLarge = document.createElement('source');
    sourceJpgLarge.sizes = '80vw';
    sourceJpgLarge.media = '(max-width: 1400px)';
    sourceJpgLarge.setAttribute('data-srcset', `/images/large/${photograph}-1600_large_2x.jpg 2x`);
    sourceJpgLarge.type = 'image/jpeg';
    picture.append(sourceJpgLarge);

    const image = document.createElement('img');
    image.alt = `${restaurant.name} Restaurant, ${restaurant.short_description}`;
    image.className = 'restaurant-img';
    image.setAttribute('data-src', `/images/large/${photograph}-1600_large_2x.jpg`);
    picture.append(image);

    return picture;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

  /**
   * Send a restaurant favorite state to the server.
   */
  static updateFavoriteRestaurant(restaurant_id, is_favorite) {
    fetch(`${DBHelper.API_SERVER_URL}/restaurants/${restaurant_id}/?is_favorite=${is_favorite}`, {
      method: 'PUT'
    })
      .then(response => response.json())
      .then(response => {
        console.log('Favorite a restaurant status updated successfully:', response);
      })
      .catch(error => {
        console.error(
          'Oops! Something went wrong while Favorite a restaurant updating. Error:',
          error
        );
      });
  }
  /**
   * Update restaurant favorite state
   */
  static updateRestaurantInLocalDB(restaurant, is_favorite) {
    dbPromise
      .then(function(db) {
        const tx = db.transaction('restaurants', 'readwrite');
        const restaurantIndex = tx.objectStore('restaurants');

        return restaurantIndex.openCursor();
      })
      .then(function updateLocalStoredRestaurant(cursor) {
        if (!cursor) return; // Empty case
        if (cursor.value.name === restaurant.name && cursor.value.id === restaurant.id) {
          const restaurantClone = { ...cursor.value };
          restaurantClone.is_favorite = is_favorite;
          cursor.update(restaurantClone);
        }

        return cursor.continue().then(updateLocalStoredRestaurant);
      })
      .then(function() {
        console.log('Done updating restaurant: ', restaurant);
      });
  }
}
