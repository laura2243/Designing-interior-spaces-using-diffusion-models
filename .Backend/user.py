from setup import db, jsonify, request, check_password_hash, session, app, generate_password_hash

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    password = db.Column(db.String(500))


    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password


    def to_json(self):
        return {"id": self.id, "name": self.name, "email": self.email, "password": self.password}


@app.route('/user/get_all', methods=['GET'])
def get_all_users():
    return jsonify([user.to_json() for user in User.query.all()])


@app.route('/login', methods=['POST'])
def login():
    email = request.json.get("email")
    password = request.json.get("password")


    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['user_name'] = user.name
        session['user_email'] = user.email


        return jsonify({
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,

            }
        }), 200
    return jsonify({"error": "Invalid username or password!"}), 401


@app.route('/register', methods=['POST'])
def register():

    name = request.json.get("name")
    email = request.json.get("email")
    password = request.json.get("password")


    users = User.query.all()
    for user in users:
        if user.email == email:
            return jsonify({"error": "Email already exists"}), 401

    hashed_password = generate_password_hash(password)

    user = User(name=name, email=email, password=hashed_password)

    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfuly!"}), 200
