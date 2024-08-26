from flask import Flask
from setup import app, db
import user, images, promptAssistant


with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True, port=5000)

#flask run --cert=localhost.pem --key=localhost-key.pem