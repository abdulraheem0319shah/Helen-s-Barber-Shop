from flask import Blueprint, jsonify, request
from database import db
from models.service import Service

service_bp = Blueprint('service', __name__, url_prefix='/api/services')

@service_bp.route('', methods=['GET'])
def get_services():
    try:
        services = Service.query.all()
        return jsonify({'success': True, 'count': len(services), 'data': [s.to_dict() for s in services]}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@service_bp.route('', methods=['POST'])
def create_service():
    try:
        data = request.get_json()
        service = Service(
            title=data['title'],
            category=data['category'],
            price=data['price'],
            is_featured=data.get('isFeatured', False),
            description=data.get('description', '')
        )
        db.session.add(service)
        db.session.commit()
        return jsonify({'success': True, 'data': service.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@service_bp.route('/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'success': False, 'error': 'Service not found'}), 404
        db.session.delete(service)
        db.session.commit()
        return jsonify({'success': True, 'data': {}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400