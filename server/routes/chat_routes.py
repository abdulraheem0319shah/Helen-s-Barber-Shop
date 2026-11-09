from flask import Blueprint, jsonify, request, current_app
from groq import Groq

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

@chat_bp.route('', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message')

        if not user_message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        # Initialize Groq Client
        client = Groq(api_key=current_app.config['GROQ_API_KEY'])

        # API Call to Groq with openai/gpt-oss-120b model
        completion = client.chat.completions.create(
            model=current_app.config['GROQ_MODEL'],
            messages=[
                {
                    "role": "system",
                    "content": "Aap ek helpful, friendly customer support aur service assistant hain."
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.7,
            max_completion_tokens=1024
        )

        reply = completion.choices[0].message.content

        return jsonify({
            'success': True,
            'reply': reply,
            'model': current_app.config['GROQ_MODEL']
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500