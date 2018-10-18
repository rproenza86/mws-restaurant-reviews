let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));

    var myLazyLoad = LazyLoad ? new LazyLoad({ elements_selector: '.restaurant-img' }) : null;
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement('li');

  const picture = DBHelper.createResponsiveImageElm(restaurant);
  li.append(picture);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const favAndMoreContainer = document.createElement('div');
  favAndMoreContainer.style.setProperty('display', 'flex');
  favAndMoreContainer.style.setProperty('flex-direction', 'row');
  favAndMoreContainer.style.setProperty('align-items', 'flex-start');
  favAndMoreContainer.style.setProperty('justify-content', 'space-between');
  li.append(favAndMoreContainer);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.onclick = () => {
    window.localStorage.setItem('restaurantId', restaurant.id);
  };
  favAndMoreContainer.append(more);

  const favoriteButton = document.createElement('button');
  favoriteButton.setAttribute('class', 'mdc-icon-button');
  favoriteButton.setAttribute('arial-hidden', 'true');
  favoriteButton.setAttribute('arial-pressed', 'false');
  favoriteButton.style.setProperty('align-self', 'center');

  favoriteButton.addEventListener(
    'MDCIconButtonToggle:change',
    function(event) {
      console.log('toggled event change', event.detail);
      console.log('corresponding restaurant', restaurant);
      DBHelper.updateFavoriteRestaurant(restaurant.id, event.detail.isOn);
      DBHelper.updateRestaurantInLocalDB(restaurant, event.detail.isOn);
    },
    false
  );

  const iconFavoriteButtonOn = document.createElement('i');
  iconFavoriteButtonOn.setAttribute(
    'class',
    'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'
  );
  iconFavoriteButtonOn.innerHTML = 'favorite';
  favoriteButton.append(iconFavoriteButtonOn);

  const iconFavoriteButtonOff = document.createElement('i');
  iconFavoriteButtonOff.setAttribute('class', 'material-icons mdc-icon-button__icon');
  iconFavoriteButtonOff.innerHTML = 'favorite_border';
  favoriteButton.append(iconFavoriteButtonOff);

  const iconButtonRipple = new window.mdc.ripple.MDCRipple(favoriteButton);
  iconButtonRipple.unbounded = true;
  const favoriteToggle = new window.mdc.iconButton.MDCIconButtonToggle(favoriteButton);
  favoriteToggle.on = restaurant.is_favorite;

  favAndMoreContainer.append(favoriteButton);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
      window.localStorage.setItem('restaurantId', restaurant.id);
    });
    self.markers.push(marker);
  });

  // To support Lighthouse A11y audit
  google.maps.event.addListenerOnce(map, 'idle', () => {
    document.getElementsByTagName('iframe')[0].title = 'Google Maps';
  });
};
