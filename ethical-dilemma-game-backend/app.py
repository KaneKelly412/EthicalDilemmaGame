import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.game_routes import game_bp
import utils.helpers as helpers

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(game_bp, url_prefix="/api/game")


# Path to Scenarios folder
#SCENARIOS_PATH = os.path.abspath("Scenarios")



# Serve the frontend
FRONTEND_FOLDER = os.path.abspath("../ethical-dilemma-game-frontend")

@app.route("/")
def serve_frontend():
    return send_from_directory(FRONTEND_FOLDER, "index.html")

@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory(FRONTEND_FOLDER, path)

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
