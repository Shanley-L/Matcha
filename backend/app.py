from flask import Flask, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Matcha!"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
