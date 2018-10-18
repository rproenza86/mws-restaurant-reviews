export interface IReviewParam {
  restaurant_id: number;
  name: string;
  rating: number;
  comments: string;
}

export interface IReview extends IReviewParam {
  id: number;
  fire_id?: string;
  createdAt: number;
  updatedAt: number;
}
