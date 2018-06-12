/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 5005 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
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
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
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
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
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
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Restaurant responsive image html element.
   */
  static createResponsiveImageElm(restaurant) {
    const photograph = restaurant.photograph.split('.')[0];
    const picture = document.createElement('picture');

    const sourceWebp1 = document.createElement('source');
    sourceWebp1.sizes="80vw";
    sourceWebp1.media="(max-width: 350px)";
    sourceWebp1.srcset=`http://localhost:5005/images/webp/30/${photograph}.webp`;
    sourceWebp1.type="image/webp";
    picture.append(sourceWebp1);

    const sourceWebp2 = document.createElement('source');
    sourceWebp2.sizes="80vw";
    sourceWebp2.media="(max-width: 800px)";
    sourceWebp2.srcset=`/images/webp/50/${photograph}.webp`;
    sourceWebp2.type="image/webp";
    picture.append(sourceWebp2);

    const sourceWebp3 = document.createElement('source');
    sourceWebp3.sizes="80vw";
    sourceWebp3.media="(max-width: 2400px)";
    sourceWebp3.srcset=`/images/webp/70/${photograph}.webp`;
    sourceWebp3.type="image/webp";
    picture.append(sourceWebp3);

    const sourceJpgSmall = document.createElement('source');
    sourceJpgSmall.sizes="80vw";
    sourceJpgSmall.media="(max-width: 350px)";
    sourceJpgSmall.srcset=`/images/small/${photograph}-350_small_1x.jpg 1x`;
    sourceJpgSmall.type="image/jpeg";
    picture.append(sourceJpgSmall);

    const sourceJpgSmall2x = document.createElement('source');
    sourceJpgSmall2x.sizes="80vw";
    sourceJpgSmall2x.media="(max-width: 500px)";
    sourceJpgSmall2x.srcset=`/images/small/${photograph}-500_small_2x.jpg 2x`;
    sourceJpgSmall2x.type="image/jpeg";
    picture.append(sourceJpgSmall2x);

    const sourceJpgMedium = document.createElement('source');
    sourceJpgMedium.sizes="80vw";
    sourceJpgMedium.media="(max-width: 1399px)";
    sourceJpgMedium.srcset=`/images/medium/${photograph}-800_medium_1x.jpg 1x`;
    sourceJpgMedium.type="image/jpeg";
    picture.append(sourceJpgMedium);

    const sourceJpgLarge = document.createElement('source');
    sourceJpgLarge.sizes="80vw";
    sourceJpgLarge.media="(max-width: 1400px)";
    sourceJpgLarge.srcset=`/images/large/${photograph}-1600_large_2x.jpg 2x`;
    sourceJpgLarge.type="image/jpeg";
    picture.append(sourceJpgLarge);

    const image = document.createElement('img');
    image.alt = `Photo of ${restaurant.name} Restaurant`;
    image.className = 'restaurant-img';
    image.src = `/images/large/${photograph}-1600_large_2x.jpg`;
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
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
