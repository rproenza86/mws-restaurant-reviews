import * as cors from 'cors';
import * as functions from 'firebase-functions';
import * as parser from 'url-parse';
import db from './firestore';
import { handleFavorites } from './favorites';

const corsHandler = cors({ origin: true });

/**
 * RestaurantId in the url Ex: "https://server/restaurants/3":
 *  -> RestaurantId == 3 will be fetch from the firestore db.
 *
 * No RestaurantId in the url Ex: "https://server/restaurants":
 *  -> All the restaurants will be fetch from the firestore db.
 * 
 * @param request
 * @param response
 */
const handleRestaurants = async (request, response) => {
  const rawRestaurantId = parser(request.url).pathname;
  const id = rawRestaurantId.split('/')[1];
  let responseObject = {};

  if (id) {
    responseObject = (await getRestaurantById(id)) || {};
  } else {
    responseObject = (await getRestaurants()) || {};
  }

  response.send(responseObject);
};

async function getRestaurants() {
  const restaurantsRef = db.collection('restaurants');

  return restaurantsRef
    .get()
    .then(snapshot => {
      const allRestaurants = [];

      snapshot.forEach(doc => {
        allRestaurants.push({ ...doc.data(), fire_id: doc.id });
      });

      return allRestaurants;
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}

async function getRestaurantById(id: string) {
  const restaurantsRef = db.collection('restaurants');

  return restaurantsRef
    .where('id', '==', Number(id))
    .get()
    .then(snapshot => {
      const allRestaurants = [];

      snapshot.forEach(doc => {
        allRestaurants.push({ ...doc.data(), fire_id: doc.id });
      });

      return allRestaurants[0] || {};
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}

/**
 * HTTP serverless function - backend endpoint
 */
export const restaurants = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const { is_favorite } = request.query;

    if (is_favorite !== undefined) {
      handleFavorites(request, response)
        .then(() => console.log('Success updating is_favorite on  handleFavorites'))
        .catch(err => console.log('Error updating is_favorite on  handleFavorites', err));
    } else {
      handleRestaurants(request, response)
        .then(() => console.log('Success updating  on  handleRestaurants'))
        .catch(err => console.log('Error updating  on  handleRestaurants', err));
    }
  });
});
