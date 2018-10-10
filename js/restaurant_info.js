let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });

    getReviews(callback);
  }
};

getReviews = callback => {
  const id = getParameterByName('id');

  DBHelper.fetchRestaurantReviewById(id, (error, reviews) => {
    self.reviews = reviews;
    if (!reviews) {
      console.error(error);
      return;
    }
    // fill reviews
    fillReviewsHTML(reviews);
    if (callback) {
      callback(null, reviews);
    }
  });
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const pictureParent = document.getElementById('restaurant-img');
  const picture = DBHelper.createResponsiveImageElm(restaurant);
  pictureParent.append(picture);

  var myLazyLoad = LazyLoad ? new LazyLoad({ elements_selector: '.restaurant-img' }) : null;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Add new review HTML to the webpage.
 */
AddNewReview = review => {
  if (reviews) {
    const ul = document.getElementById('reviews-list');
    ul.appendChild(createReviewHTML(review));
  }
  return;
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  if (review.date) {
    const date = document.createElement('p');
    date.innerHTML = review.date;
    li.appendChild(date);
  }

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Restaurant review form. Material Design component setup
 */
const shippingForm = document.querySelector('#crane-shipping-form');
shippingForm.addEventListener('submit', evt => {
  evt.preventDefault();

  DBHelper.saveReview(AddNewReview);
});

new window.mdc.ripple.MDCRipple(document.querySelector('.mdc-button'));
new window.mdc.select.MDCSelect(document.querySelector('.mdc-select'));

const textFieldElements = [].slice.call(document.querySelectorAll('.mdc-text-field'));
textFieldElements.forEach(textFieldEl => {
  new window.mdc.textField.MDCTextField(textFieldEl);
});

const snackbar = new window.mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));
const notifyAppOffline = () => {
  const notificationObject = {
    message: 'Application working OFFLINE',
    actionText: 'Ok',
    actionHandler: function () {
      console.log('my cool function');
    },
    timeout: 5000
  };

  snackbar.show(notificationObject);
}
const notifyAppOnline = () => {
  const notificationObject = {
    message: 'Application working ONLINE',
    actionText: 'Ok',
    actionHandler: function() {
      console.log('my cool function');
    },
    timeout: 5000
  };

  snackbar.show(notificationObject);
};

window.addEventListener('online', (event) => {
  notifyAppOnline();
}
);

window.addEventListener('offline', (event) => notifyAppOffline());