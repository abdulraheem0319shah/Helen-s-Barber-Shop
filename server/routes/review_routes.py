from flask import Blueprint, jsonify, request
from database import db
from models.review import Review

review_bp = Blueprint('review', __name__, url_prefix='/api/reviews')

@review_bp.route('', methods=['GET'])
def get_reviews():
    try:
        reviews = Review.query.order_by(Review.created_at.desc()).all()
        return jsonify({'success': True, 'count': len(reviews), 'data': [r.to_dict() for r in reviews]}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@review_bp.route('', methods=['POST'])
def create_review():
    try:
        data = request.get_json()
        review = Review(
            name=data['name'],
            rating=data['rating'],
            comment=data['comment'],
            service_used=data.get('serviceUsed', 'General')
        )
        db.session.add(review)
        db.session.commit()
        return jsonify({'success': True, 'data': review.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@review_bp.route('/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({'success': False, 'error': 'Review not found'}), 404
        db.session.delete(review)
        db.session.commit()
        return jsonify({'success': True, 'data': {}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400