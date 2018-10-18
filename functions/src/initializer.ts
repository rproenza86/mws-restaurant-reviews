import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import restaurantsList from './__mock__/restaurants';
import reviewsList from './__mock__/reviews';

admin.initializeApp();

export const init = functions.https.onRequest((request, response) => {
  try {
    const db = admin.firestore();

    for (const restaurant of restaurantsList) {
      db.collection('restaurants')
        .add(restaurant)
        .then(function(docRef) {
          console.log('Document written with ID: ', docRef.id);
        })
        .catch(function(error) {
          console.error('Error adding document: ', error);
        });
    }

    for (const review of reviewsList()) {
      db.collection('reviews')
        .add(review)
        .then(function(docRef) {
          console.log('Document written with ID: ', docRef.id);
        })
        .catch(function(error) {
          console.error('Error adding document: ', error);
        });
    }

    response.send('DB Initialized');
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});
