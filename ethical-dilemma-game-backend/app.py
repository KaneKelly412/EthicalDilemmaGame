from flask import Flask
from flask_cors import CORS
from routes.game_routes import game_bp
import utils.helpers as helpers

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(game_bp, url_prefix="/api/game")

scenarios = helpers.load_json("config.json")

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
