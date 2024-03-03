from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import math
import re
import calendar
import json
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import requests
from operator import itemgetter
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_bcrypt import Bcrypt
import eventlet
import pytz

app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = 'Team_leader_254'
expiration_time = timedelta(days=1)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = expiration_time
jwt = JWTManager(app)
CORS(app, origins='http://localhost:3000')

eventlet.monkey_patch()

socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins='http://localhost:3000')


connected_clients = set()


@socketio.on('connect')
def on_connect():
    print('New client connected')
    connected_clients.add(request.sid)



@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')
    connected_clients.remove(request.sid)


def send_data_to_clients(data):
    socketio.emit('fire_update', data, namespace='/')



def create_connection():
    DATABASE_URL = 'postgres://yhqrmqhgamnxox:db2133a94a75369ed2a4fd2614ae802d9e8a5bf8ceaab75ad4ff5c872e7176a5@ec2-44-213-228-107.compute-1.amazonaws.com:5432/d1bqb0pnc4df0t'

    try:
        connection = psycopg2.connect(DATABASE_URL, sslmode='require')
        return connection

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL:", error)




def hash_password(password):
    return bcrypt.generate_password_hash(password).decode('utf-8')


def verify_password(password, hashed_password):
    return bcrypt.check_password_hash(hashed_password, password)



def create_users_table(connection):
    try:
        cursor = connection.cursor()
        create_table_query = '''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                idno VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(15) NOT NULL,
                role VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        '''
        cursor.execute(create_table_query)
        connection.commit()
        print("Users table created")
    except Error as e:
        print(f"Error creating table: {e}")


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        idno = data.get('idno')
        password = data.get('password')

        if not idno or not password:
            return jsonify({'error': 'Invalid input data'}), 400

        connection = create_connection()
        if connection:
            cursor = connection.cursor()
            check_query = '''
                SELECT idno, role, password FROM users WHERE idno = %s
            '''
            cursor.execute(check_query, (idno,))
            user_data = cursor.fetchone()
            cursor.close()
            connection.close()

            if user_data and verify_password(password, user_data[2]):
                access_token = create_access_token(identity={'idno': user_data[0], 'role': user_data[1]})

                response_data = {
                    'user': {'idno': user_data[0], 'role': user_data[1]},
                    'token': access_token,
                    'message': 'Login successful'
                }

                response = make_response(jsonify(response_data))

                
                expiration_time = datetime.utcnow() + timedelta(days=1)

                return response, 200
            else:
                return jsonify({'error': 'Invalid ID Number or password'}), 401
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500



def is_phone_registered(connection, phone):
    try:
        cur = connection.cursor()
        cur.execute('SELECT phone FROM users WHERE phone = %s', (phone,))
        result = cur.fetchone()
        cur.close()
        return result is not None
    except Exception as e:
        print("Error:", e)
        return False


def is_email_registered(connection, idno):
    try:
        cur = connection.cursor()
        cur.execute('SELECT idno FROM users WHERE idno = %s', (idno,))
        result = cur.fetchone()
        cur.close()
        print(result)
        print(result is not None)
        return result is not None
    except Exception as e:
        print("Error:", e)
        return False


def update_users_table(data):
    socketio.emit('update_users', data, namespace='/')


@app.route('/adduser', methods=['POST'])
@jwt_required()
def add_user():
    try:
        current_user = get_jwt_identity()
        data = request.json
        name = data['name']
        idno = data['idno']
        phone = data['phone']
        role = data['role']
        password = data['password']

        if not (current_user['role'] == 'administrator'):
            return jsonify({'error': 'You cannot perform this action.'}), 403

        if not name:
            return jsonify({'error': 'Please enter your name.'}), 400
        elif not idno:
            return jsonify({'error': 'Please enter your ID Number.'}), 400
        elif role == 'role':
            return jsonify({'error': 'Please select a role.'}), 400
        elif not phone:
            return jsonify({'error': 'Please enter your phone number.'}), 400
        elif not re.match(r'^0|254\d{9}$', phone):
            return jsonify({'error': 'Invalid phone number. Please enter a valid Kenyan phone number starting with 0 or 254.'}), 400
        elif not password:
            return jsonify({'error': 'Please enter a password.'}), 400
        elif len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long.'}), 400

        connection = create_connection()
        if connection:
            create_users_table(connection)

            if is_email_registered(connection, idno):
                connection.close()
                return jsonify({'error': 'ID Number already registered.'}), 409
            if is_phone_registered(connection, phone):
                connection.close()
                return jsonify({'error': 'Phone already registered.'}), 409

            hashed_password = hash_password(password)

            cursor = connection.cursor()
            insert_query = '''
                INSERT INTO users (name, idno, phone, role, password)
                VALUES (%s, %s, %s, %s, %s)
            '''
            cursor.execute(insert_query, (name, idno, phone, role, hashed_password))
            connection.commit()
            cursor.close()
            connection.close()
            update_users_table(data)
            return jsonify({'message': 'User added successfully!'}), 200
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        print(e)
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500


def create_payments_table(connection):
    try:
        cursor = connection.cursor()
        create_table_query = '''
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                idno VARCHAR(255),
                amount DECIMAL(10, 2),
                receipt_no VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        '''
        cursor.execute(create_table_query)
        connection.commit()
        print("Payments table created")
    except Exception as e:
        print(f"Error creating table: {e}")


@app.route('/add_payment', methods=['POST'])
@jwt_required()
def add_payment():
    try:
        current_user = get_jwt_identity()
        data = request.json
        amount = data['amount']
        idno = data['idno']
        receipt = data['receipt']

        if not (current_user['role'] == 'administrator'):
            return jsonify({'error': 'You cannot perform this action.'}), 403

        if not amount or not isinstance(amount, (int, float)) or amount < 0:
            return jsonify({'error': 'Please enter a valid positive amount.'}), 400

        if not idno or not re.match(r'^\d{7,}$', idno):
            return jsonify({'error': 'Please enter a valid ID Number with at least 7 digits.'}), 400

        if not receipt:
            return jsonify({'error': 'Please enter a valid Receipt Number.'}), 400

        connection = create_connection()
        if connection:
            create_payments_table(connection)

            if not is_email_registered(connection, idno):
                connection.close()
                return jsonify({'error': f'ID Number : {idno} is not registered.'}), 409

            cursor = connection.cursor()

            
            east_africa_timezone = pytz.timezone('Africa/Nairobi')
            current_time = datetime.now(east_africa_timezone)

            insert_query = '''
                INSERT INTO payments (idno, amount, receipt_no, created_at)
                VALUES (%s, %s, %s, %s)
            '''
            cursor.execute(insert_query, (idno, amount, receipt, current_time))
            connection.commit()
            cursor.close()
            connection.close()
            update_users_table(data)
            return jsonify({'message': 'Payment added successfully!'}), 200
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        print(e)
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500



@app.route('/get_payments', methods=['GET'])
@jwt_required()
def get_payments():
    try:
        connection = create_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        page = int(request.args.get('page', 1))
        limit = 6
        start_idx = (page - 1) * limit

        # Get the category and search_string parameters from the URL
        selected_category = request.args.get('category', 'all')
        search_string = request.args.get('searchstring', '')

        # Define a variable to hold the start time for the filter
        start_time = None

        # Calculate the start_time based on the selected category
        if selected_category == 'today':
            start_time = datetime.now() - timedelta(hours=24)
        elif selected_category == 'week':
            start_time = datetime.now() - timedelta(days=7)

        # Fetch payments data from the payments and users tables with a JOIN
        query = '''
            SELECT users.name, users.phone, payments.idno, payments.receipt_no, payments.amount, 
            to_char(payments.created_at AT TIME ZONE 'Africa/Nairobi', 'Dy, DD Mon YYYY HH24:MI:SS "EAT"') AS created_at
            FROM payments
            JOIN users ON payments.idno = users.idno
        '''

        # Create a list of values to be passed as parameters to the cursor.execute() method
        query_params = []

        # If a start_time is defined, add a WHERE clause to filter by created_at time
        if start_time:
            query += ' WHERE payments.created_at >= %s '
            query_params.append(start_time)

        # If a search_string is provided, add a condition to check for matches in phone, idno, and name
        if search_string:
            query += ' AND (users.phone ILIKE %s OR payments.idno ILIKE %s OR users.name ILIKE %s)'
            query_params.extend([f'%{search_string}%', f'%{search_string}%', f'%{search_string}%'])

        query += '''
            ORDER BY payments.created_at DESC
            LIMIT %s OFFSET %s
        '''
        query_params.extend([limit, start_idx])

        cursor.execute(query, query_params)
        payments = cursor.fetchall()

        return jsonify(payments), 200

    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500



@app.route('/get_users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        connection = create_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        
        category = request.args.get('category', 'all')
        category = category.lower()

        
        search_string = request.args.get('searchstring', '')
        search_string = search_string.lower()

        page = int(request.args.get('page', 1))
        limit = 6

        
        start_idx = (page - 1) * limit

        if category == 'all':
            
            cursor.execute(
                'SELECT id, name, idno, phone, CONCAT(UPPER(LEFT(role, 1)), LOWER(SUBSTRING(role, 2))) AS role FROM users WHERE LOWER(name) LIKE %s OR LOWER(idno) LIKE %s OR LOWER(phone) LIKE %s LIMIT %s OFFSET %s',
                (f'%{search_string}%', f'%{search_string}%', f'%{search_string}%', limit, start_idx))
        else:
            cursor.execute(
                'SELECT id, name, idno, phone, CONCAT(UPPER(LEFT(role, 1)), LOWER(SUBSTRING(role, 2))) AS role FROM users WHERE LOWER(role) = %s AND (LOWER(name) LIKE %s OR LOWER(idno) LIKE %s OR LOWER(phone) LIKE %s) LIMIT %s OFFSET %s',
                (category, f'%{search_string}%', f'%{search_string}%', f'%{search_string}%', limit, start_idx))

        users = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500


@app.route('/deleteuser/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user = get_jwt_identity()

        if not (current_user['role'] == 'administrator'):
            return jsonify({'error': 'You cannot perform this action.'}), 403

        connection = create_connection()
        if connection:
            cur = connection.cursor()
            cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
            connection.commit()
            cur.close()
            connection.close()
            return jsonify({'message': 'User deleted successfully!'}), 200
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon'}), 500



@app.route('/get_user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        connection = create_connection()
        if connection:
            cur = connection.cursor(cursor_factory=RealDictCursor)

            cur.execute('SELECT name, idno, phone, role FROM users WHERE id = %s', (user_id,))
            user_data = cur.fetchone()
            cur.close()
            connection.close()

            if user_data:
                return jsonify({'user': user_data}), 200
            else:
                return jsonify({'error': 'User not found'}), 200
        else:
            return jsonify({'error': 'Database connection error'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred : {e}'}), 200




@app.route('/update_user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        data = request.json
        name = data['name']
        idno = data['idno']
        phone = data['phone']
        role = data['role']

        current_user = get_jwt_identity()

        if not(current_user['role'] == 'administrator'):
            return jsonify({'error': 'You cannot perform this action.'}), 403
        
        if not name:
            return jsonify({'error': 'Please enter your name.'}), 400
        elif not idno:
            return jsonify({'error': 'Please enter your ID Number.'}), 400
        elif role == 'role':
            return jsonify({'error': 'Please select a role.'}), 400 

        connection = create_connection()
        if connection:
            cur = connection.cursor()

            # Check if the user with the given user_id exists
            cur.execute('SELECT * FROM users WHERE id = %s', (user_id,))
            existing_user = cur.fetchone()

            if existing_user:
                # Check if the updated email already exists for another user
                cur.execute('SELECT id FROM users WHERE idno = %s AND id != %s', (idno, user_id))
                duplicate_email_user = cur.fetchone()
                cur.execute('SELECT id FROM users WHERE phone = %s AND id != %s', (phone, user_id))
                duplicate_phone_user = cur.fetchone()

                if duplicate_email_user:
                    cur.close()
                    connection.close()
                    return jsonify({'error': 'ID Number already registered for another user.'}), 409


                if duplicate_phone_user:
                    cur.close()
                    connection.close()
                    return jsonify({'error': 'Phone already registered for another user.'}), 409
                # Update user details
                cur.execute('UPDATE users SET name = %s, idno = %s, phone = %s, role = %s WHERE id = %s', (name, idno, phone, role, user_id))
                connection.commit()
                cur.close()
                connection.close()
                return jsonify({'message': 'User details updated successfully!'}), 200
            else:
                cur.close()
                connection.close()
                return jsonify({'error': 'User not found.'}), 404
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon'}), 500


@app.route('/get_user_payments', methods=['GET'])
@jwt_required()
def get_user_payments():
    user = get_jwt_identity()
    user_id = user['idno']
    print(user_id)

    page = int(request.args.get('page', 1))
    limit = 6
    start_idx = (page - 1) * limit

    
    selected_category = request.args.get('category', 'all')

    start_time = None

    if selected_category == 'today':
        start_time = datetime.now() - timedelta(hours=24)
    elif selected_category == 'week':
        start_time = datetime.now() - timedelta(days=7)

    try:
        connection = create_connection()
        if connection:
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            query = '''
            SELECT receipt_no, amount, to_char(created_at AT TIME ZONE 'Africa/Nairobi', 'Dy, DD Mon YYYY HH24:MI:SS "EAT"') AS created_at FROM payments WHERE idno = %s
            '''

            query_params = [user_id]

            # If a start_time is defined, add a WHERE clause to filter by created_at time
            if start_time:
                query += ' AND created_at >= %s '
                query_params.append(start_time)
            
            query += '''
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            '''
            query_params.extend([limit, start_idx])
            
            cursor.execute(query, query_params)
            payments = cursor.fetchall()

            return jsonify(payments), 200
        else:
            return jsonify({'error' : 'Connection could not be made'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500



def create_loans_table(connection):
    try:
        cursor = connection.cursor()
        create_table_query = '''
            CREATE TABLE IF NOT EXISTS loans (
                id SERIAL PRIMARY KEY,
                idno VARCHAR(255),
                amount DECIMAL(10, 2),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                status VARCHAR(50) DEFAULT 'pending'
            )
        '''
        cursor.execute(create_table_query)
        connection.commit()
        print("Loans table created")
    except Exception as e:
        print(f"Error creating table: {e}")


@app.route('/request_loan', methods=['POST'])
@jwt_required()
def request_loan():
    user = get_jwt_identity()
    user_id = user['idno']
    data = request.json
    amount = data['amount']

    if not amount or not isinstance(amount, (int, float)) or amount < 0:
        return jsonify({'error': 'Please enter a valid positive amount.'}), 400

    try:
        connection = create_connection()
        if connection:
            cursor = connection.cursor()

            create_loans_table(connection)

            east_africa_timezone = pytz.timezone('Africa/Nairobi')
            current_time = datetime.now(east_africa_timezone)

            query = '''
                INSERT INTO loans(idno, amount, created_at) VALUES(%s, %s, %s)
            '''

            cursor.execute(query, (user_id, amount, current_time))

            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({'message': 'Loan requested successfully!'}), 200
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500



@app.route('/update_loan_status/<int:id>', methods=['PUT'])
@jwt_required()
def update_loan_status(id):
    user = get_jwt_identity()
    data = request.json
    status = data['status']

    if not (user['role'] == 'administrator'):
        return jsonify({'error': 'You cannot perform this action.'}), 403

    try:
        connection = create_connection()
        if connection:
            cursor = connection.cursor()

            query = '''
            UPDATE loans SET status = %s WHERE id = %s
            '''

            cursor.execute(query, (status, id))
            connection.commit()

            return jsonify({'message': 'Loan status updated successfully'}), 200
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500




@app.route('/get_loans', methods=['GET'])
@jwt_required()
def get_loans():
    user = get_jwt_identity()
    user_role = user['role']
    if not (user_role == 'administrator' or user_role == 'staff'):
        return jsonify({'error': 'You cannot perform this action.'}), 403

    try:
        connection = create_connection()
        if connection:
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            page = int(request.args.get('page', 1))
            limit = 6

            start_idx = (page - 1) * limit

            selected_category = request.args.get('category', 'all')
            search_string = request.args.get('searchstring', '')

            start_time = None

            # Calculate the start_time based on the selected category
            if selected_category == 'today':
                start_time = datetime.now() - timedelta(hours=24)
            elif selected_category == 'week':
                start_time = datetime.now() - timedelta(days=7)

            
            query = '''
            SELECT loans.id, users.name, users.phone, loans.idno, loans.amount, 
            to_char(loans.created_at AT TIME ZONE 'Africa/Nairobi', 'Dy, DD Mon YYYY HH24:MI:SS "EAT"') AS created_at, loans.status
            FROM loans JOIN users ON loans.idno = users.idno
            '''


            query_params = []

            
            if start_time:
                query += ' WHERE loans.created_at >= %s '
                query_params.append(start_time)
            
            if search_string:
                query += ' AND (users.phone ILIKE %s OR loans.idno ILIKE %s OR users.name ILIKE %s)'
                query_params.extend([f'%{search_string}%', f'%{search_string}%', f'%{search_string}%'])

            query += '''
                ORDER BY loans.created_at DESC
                LIMIT %s OFFSET %s
            '''
            query_params.extend([limit, start_idx])
            cursor.execute(query, query_params)
            loans = cursor.fetchall()

            return jsonify(loans), 200
        else:
            return jsonify({'error': 'Database connection error.'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500


@app.route('/get_user_loans', methods=['GET'])
@jwt_required()
def get_user_loans():
    user = get_jwt_identity()
    user_id = user['idno']
    print(user_id)

    page = int(request.args.get('page', 1))
    limit = 6
    start_idx = (page - 1) * limit

    selected_category = request.args.get('category', 'all')

    start_time = None

    if selected_category == 'today':
        start_time = datetime.now() - timedelta(hours=24)
    elif selected_category == 'week':
        start_time = datetime.now() - timedelta(days=7)

    try:
        connection = create_connection()
        if connection:
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            query = '''
            SELECT amount, to_char(created_at AT TIME ZONE 'Africa/Nairobi', 'Dy, DD Mon YYYY HH24:MI:SS "EAT"') AS created_at, status FROM loans WHERE idno = %s
            '''

            query_params = [user_id]

            
            if start_time:
                query += ' AND created_at >= %s '
                query_params.append(start_time)

            query += '''
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            '''
            query_params.extend([limit, start_idx])

            cursor.execute(query, query_params)
            loans = cursor.fetchall()

            return jsonify(loans), 200
        else:
            return jsonify({'error': 'Connection could not be made'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred. We are fixing this soon : {e}'}), 500



@app.route('/validate_session', methods=['GET'])
@jwt_required()
def validate_session():
    try:
        current_user = get_jwt_identity()
        return jsonify({'user': current_user}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'User not found'}), 401



if __name__ == '__main__':

    socketio.run(app, debug=True)