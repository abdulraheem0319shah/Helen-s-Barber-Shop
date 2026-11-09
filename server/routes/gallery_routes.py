from flask import Blueprint, jsonify, request
from database import db
from models.gallery import Gallery

gallery_bp = Blueprint('gallery', __name__, url_prefix='/api/gallery')

@gallery_bp.route('', methods=['GET'])
def get_gallery():
    try:
        items = Gallery.query.order_by(Gallery.created_at.desc()).all()
        return jsonify({'success': True, 'count': len(items), 'data': [item.to_dict() for item in items]}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('', methods=['POST'])
def add_gallery_item():
    try:
        data = request.get_json()
        item = Gallery(
            title=data['title'],
            image_url=data['imageUrl'],
            category=data.get('category', 'General')
        )
        db.session.add(item)
        db.session.commit()
        return jsonify({'success': True, 'data': item.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@gallery_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_gallery_item(item_id):
    try:
        item = Gallery.query.get(item_id)
        if not item:
            return jsonify({'success': False, 'error': 'Item not found'}), 404
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True, 'data': {}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400