import * as cors from 'cors';
import * as functions from 'firebase-functions';
import * as parser from 'url-parse';
import db from './firestore';

const corsHandler = cors({ origin: true });

const updateRestaurantFavorite = async (id: string, is_favorite: boolean): Promise<any> => {
  return db
    .collection('restaurants')
    .where('id', '==', Number(id))
    .get()
    .then(function(querySnapshot) {
      let updatedRestaurant;

      querySnapshot.forEach(async function(doc) {
        updatedRestaurant = { ...doc.data() };

        const writeResult = await db
          .collection('restaurants')
          .doc(doc.id)
          .update({ is_favorite: JSON.parse(is_favorite as any) })
          .then(result => {
            console.log('Success updating is_favorite');
            return result;
          })
          .catch(err => console.log('Error updating is_favorite', err));

        return updatedRestaurant;
      });

      updatedRestaurant.is_favorite = is_favorite;
      return updatedRestaurant;
    })
    .catch(err => {
      console.log('Error updating documents', err);
    });
};

export const handleFavorites = async (request, response) => {
  const { is_favorite } = request.query;
  const rawRestaurantId = parser(request.url).pathname;
  const restaurantId = rawRestaurantId.split('/')[1];
  let responseObject = {};

  if (restaurantId) {
    responseObject = await updateRestaurantFavorite(restaurantId, is_favorite);
  }

  response.send(responseObject);
};

/**
 * HTTP serverless function - backend endpoint
 */
export const favorites = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    handleFavorites(request, response)
      .then(() => console.log('Success updating is_favorite on  handleFavorites'))
      .catch(err => console.log('Error updating is_favorite on  handleFavorites', err));
  });
});
