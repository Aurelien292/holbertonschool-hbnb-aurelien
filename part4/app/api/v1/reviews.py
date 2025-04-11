from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})
review_update_model = api.model('ReviewUpdate', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
})

@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """Register a new review"""
        current_user = get_jwt_identity()
        review_data = api.payload
        # Assure-toi que 'rating' est bien un entier
        try:
            review_data['rating'] = int(review_data['rating'])
        except ValueError:
            return {'error': 'Rating must be an integer between 1 and 5'}, 400

        # Validation pour éviter les notes en dehors de la plage (1-5)
        if review_data['rating'] < 1 or review_data['rating'] > 5:
            return {'error': 'Rating must be between 1 and 5'}, 400
        
        review_count = facade.get_review_count_by_user_place(review_data['user_id'], review_data['place_id'])
        place = facade.get_place(review_data['place_id'])
        if not place:
            return {'error': 'Place not found'}, 404
        if place.owner_id == current_user['id']:
            return {'error': 'You cannot review your own place.'}, 400
        if review_count > 0:
            return {'error': 'You can only review a place once.'}, 400

        try:
            new_review = facade.create_review(review_data)
            return {'id': new_review.id, 'text': new_review.text, 'rating': new_review.rating, 'user_id': new_review.user.id, 'place_id': new_review.place.id}, 201
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()
        return [{'id': review.id, 'text': review.text, 'rating': review.rating} for review in reviews], 200

@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        return {'id': review.id, 'text': review.text, 'rating': review.rating, 'user_id': review.user.id, 'place_id': review.place.id}, 200

    @api.expect(review_update_model)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, review_id):
        """Update a review's information"""
        current_user = get_jwt_identity()
        review_data = api.payload
        # Set is_admin default to False if not exists
        is_admin = current_user.get('is_admin', False)
        user_id = current_user.get('id')

        reviews = facade.get_review(review_id)
        if not is_admin and reviews.user_id != user_id:
            return {'error': 'Unauthorized action'}, 403

        try:
            review = facade.update_review(review_id, review_data)
            if review is None:
                return {'error': 'Review not found'}, 404
            return {'message': 'Review updated successfully'}, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    @jwt_required()
    def delete(self, review_id):
        """Delete a review"""
        current_user = get_jwt_identity()
        # Set is_admin default to False if not exists
        is_admin = current_user.get('is_admin', False)
        user_id = current_user.get('id')

        review = facade.get_review(review_id)
        
        if review is None:
            return {'error': 'Review not found'}, 404
        
        if not is_admin and review.user_id != user_id:
            return {'error': 'Unauthorized action'}, 403
        
        try:
            facade.delete_review(review_id)
        except Exception as e:
            return {'error': str(e)}, 400
        
        
        return {'message': 'Review deleted successfully'}, 200

@api.route('/places/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        reviews = facade.get_reviews_by_place(place_id)
        if reviews is None:
            return {'error': 'Place not found'}, 404
        return [{'id': review.id, 'text': review.text, 'rating': review.rating, 'user_id': review.user.id, 'place_id': review.place.id, 'first_name': review.user.first_name,'last_name': review.user.last_name} for review in reviews], 200
