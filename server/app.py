from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import os
from dotenv import load_dotenv
from groq import Groq

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or os.urandom(32).hex()

DATABASE = os.path.join(BASE_DIR, 'barber.db')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', '').strip().lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            service_name TEXT NOT NULL,
            price TEXT NOT NULL,
            booking_date DATE NOT NULL,
            booking_time TIME NOT NULL,
            status TEXT DEFAULT 'Confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()


init_db()


# ==========================================
# 1. PUBLIC PAGE ROUTES
# ==========================================

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/about.html')
def about():
    return render_template('about.html')


@app.route('/contact.html')
def contact():
    return render_template('contact.html')


@app.route('/feedback.html')
def feedback():
    return render_template('feedback.html')


@app.route('/gallery.html')
def gallery():
    return render_template('gallery.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, full_name, password FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()

        if not user or user['password'] != password:
            return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

        session['user_id'] = user['id']
        session['user_name'] = user['full_name']

        return jsonify({
            'success': True,
            'message': 'Login successful.',
            'user': {'id': user['id'], 'full_name': user['full_name'], 'email': email}
        }), 200

    return render_template('login.html')


@app.route('/login.html')
def login_page():
    return redirect(url_for('login'))


@app.route('/signin')
def signin_page():
    return redirect(url_for('login'))


@app.route('/services.html')
def services():
    return render_template('services.html')


# ==========================================
# 2. AUTH ROUTES
# ==========================================

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or request.form
    full_name = (data.get('full_name') or data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not full_name or not email or not password:
        return jsonify({'success': False, 'message': 'Full name, email, and password are required.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'User already exists with this email.'}), 409

        cursor.execute(
            'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
            (full_name, email, password)
        )
        user_id = cursor.lastrowid
        conn.commit()

        session['user_id'] = user_id
        session['user_name'] = full_name

        return jsonify({
            'success': True,
            'message': 'Signup successful.',
            'user': {'id': user_id, 'full_name': full_name, 'email': email}
        }), 201
    except Exception as exc:
        conn.rollback()
        return jsonify({'success': False, 'message': str(exc)}), 500
    finally:
        conn.close()


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect(url_for('home'))


# ==========================================
# 3. BOOKING APPOINTMENT ROUTE
# ==========================================

@app.route('/book-appointment', methods=['POST'])
def book_appointment():
    data = request.get_json(silent=True) or request.form
    customer_name = (data.get('name') or data.get('customer_name') or '').strip()
    service_full = (data.get('service') or '').strip()
    booking_date = (data.get('date') or '').strip()
    booking_time = (data.get('time') or '').strip()

    if not customer_name or not service_full or not booking_date or not booking_time:
        return jsonify({'status': 'error', 'message': 'Customer name, service, date, and time are required.'}), 400

    if ' - ' in service_full:
        service_name, price = service_full.split(' - ', 1)
    elif ' — ' in service_full:
        service_name, price = service_full.split(' — ', 1)
    else:
        service_name = service_full
        price = 'N/A'

    user_id = session.get('user_id')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            '''
            INSERT INTO bookings (user_id, customer_name, service_name, price, booking_date, booking_time)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (user_id, customer_name, service_name.strip(), price.strip(), booking_date, booking_time)
        )
        conn.commit()
        return jsonify({'status': 'success', 'message': 'Appointment booked successfully!'}), 201
    except Exception as exc:
        conn.rollback()
        return jsonify({'status': 'error', 'message': str(exc)}), 500
    finally:
        conn.close()


# ==========================================
# 4. AI CHATBOT ROUTE
# ==========================================

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True) or request.form
    user_message = (data.get('message') or '').strip()
    user_id = session.get('user_id')

    if not user_message:
        return jsonify({'response': 'Please enter a message.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO chats (user_id, sender, message) VALUES (?, ?, ?)',
        (user_id, 'user', user_message)
    )
    conn.commit()
    conn.close()

    if groq_client is None:
        ai_response = (
            'Hello! I can help with service recommendations, pricing, and booking support. '
            'Our shop name is Helen\'s Barber Shop. For a fast booking, choose your service and tell us your preferred date and time.'
        )
    else:
        try:
            completion = groq_client.chat.completions.create(
                model='openai/gpt-oss-120b',
                messages=[
                    {
                        'role': 'system',
                        'content': (
                            'You are the AI assistant for Helen\'s Barber Shop. '
                            'The official shop name is "Helen\'s Barber Shop". '
                            'Always answer clearly and politely in English or Roman Urdu. '
                            'Always use proper standard English spacing, punctuation, and clear paragraph breaks between words. Never concatenate or smash words together. '
                            'If the user asks "what is your shop name?", "shop name", "apka shop ka naam kya hai?", "shop ka naam", "what is the name of your shop?", or similar, reply exactly: "Our shop name is Helen\'s Barber Shop." '
                            'Also answer questions about services, pricing, appointments, hours, location, and customer support. '
                            'Location: 2006 Firestone Blvd, Los Angeles, CA 90001. Hours: Mon-Sat 10:00 AM - 6:00 PM.'
                        )
                    },
                    {'role': 'user', 'content': user_message}
                ]
            )
            raw_response = str(completion.choices[0].message.content or '').strip()
            paragraphs = [' '.join(paragraph.split()) for paragraph in raw_response.split('\n\n')]
            ai_response = '\n\n'.join(paragraph for paragraph in paragraphs if paragraph)
        except Exception as exc:
            print('Chat Error:', exc)
            ai_response = 'Sorry, I am having trouble connecting right now. Please try again in a moment.'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO chats (user_id, sender, message) VALUES (?, ?, ?)',
        (user_id, 'bot', ai_response)
    )
    conn.commit()
    conn.close()

    return jsonify({'response': ai_response})


# ==========================================
# 5. ADMIN AUTH + DASHBOARD
# ==========================================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = (request.form.get('username') or '').strip().lower()
        password = request.form.get('password') or ''

        if ADMIN_USERNAME and ADMIN_PASSWORD and username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))

        return render_template('admin_login.html', error='Invalid admin credentials.'), 401

    return render_template('admin_login.html')


@app.route('/admin/logout', methods=['GET', 'POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))


@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))

    selected_date = request.args.get('date', '').strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    if selected_date:
        cursor.execute(
            '''
            SELECT b.*, u.full_name AS user_name
            FROM bookings b
            LEFT JOIN users u ON u.id = b.user_id
            WHERE b.booking_date = ?
            ORDER BY b.booking_date DESC, b.booking_time DESC
            ''',
            (selected_date,)
        )
    else:
        cursor.execute(
            '''
            SELECT b.*, u.full_name AS user_name
            FROM bookings b
            LEFT JOIN users u ON u.id = b.user_id
            ORDER BY b.booking_date DESC, b.booking_time DESC
            '''
        )

    bookings = cursor.fetchall()
    conn.close()

    return render_template('admin_dashboard.html', bookings=bookings, selected_date=selected_date)


@app.route('/admin/booking/update/<int:id>', methods=['POST'])
def admin_update_booking(id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))

    status = request.form.get('status', 'Confirmed')
    valid_statuses = {'Confirmed', 'Completed', 'Cancelled'}
    if status not in valid_statuses:
        status = 'Confirmed'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE bookings SET status = ? WHERE id = ?', (status, id))
    conn.commit()
    conn.close()

    selected_date = request.form.get('selected_date', '')
    return redirect(url_for('admin_dashboard', date=selected_date))


@app.route('/admin/booking/delete/<int:id>', methods=['POST'])
def admin_delete_booking(id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM bookings WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    selected_date = request.form.get('selected_date', '')
    return redirect(url_for('admin_dashboard', date=selected_date))


if __name__ == '__main__':
    app.run(debug=True, port=5000)