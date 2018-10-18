import * as cors from 'cors';
import * as functions from 'firebase-functions';
import { IReview, IReviewParam } from './common/interfaces';
import db from './firestore';

const corsHandler = cors({ origin: true });

type reviewResponse = IReview[] | IReview;

/**
 * Return a counter with the total of reviews on db
 */
async function getReviewsSize() {
  return db
    .collection('reviews')
    .get()
    .then(function(querySnapshot) {
      return querySnapshot.size;
    });
}

/**
 * Add a new review to the firestore db
 * @param review
 */
const addReview = async (review: IReviewParam): Promise<IReview> => {
  const id = (await getReviewsSize()) + 1;
  const createdAt = new Date().getTime();
  const updatedAt = createdAt;
  const { restaurant_id, name, rating, comments } = review;

  const newReview: IReview = {
    id,
    restaurant_id: Number(restaurant_id),
    name,
    rating,
    comments,
    createdAt,
    updatedAt
  };

  try {
    return db
      .collection('reviews')
      .add(newReview)
      .then(ref => {
        console.log('Added document with ID: ', ref.id);
        return newReview;
      });
  } catch (error) {
    console.log('Error saving review', error);
    return error;
  }
};

/**
 *  Find a  review on the firestore db
 * @param id
 */
async function findReviewsByRestaurantId(id: string) {
  const reviewsRef = db.collection('reviews');

  return reviewsRef
    .where('restaurant_id', '==', Number(id))
    .get()
    .then(snapshot => {
      const allReviews = [];

      snapshot.forEach(doc => {
        allReviews.push({ ...doc.data(), fire_id: doc.id });
      });

      return allReviews;
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}

/**
 * HTTP serverless function - backend endpoint
 */
export const reviews = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    let responseObject: reviewResponse;

    switch (request.method) {
      case 'POST': {
        const newReview = request.body;
        responseObject = await addReview(newReview);
        break;
      }
      default: {
        const { restaurant_id } = request.query;

        if (restaurant_id) {
          responseObject = await findReviewsByRestaurantId(restaurant_id) || [];
        }
        break;
      }
    }

    response.send(responseObject);
  });
});
