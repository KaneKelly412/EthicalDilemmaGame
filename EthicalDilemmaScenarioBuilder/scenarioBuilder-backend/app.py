from flask import Flask, request, jsonify, send_file, send_from_directory
import json
import os
import sys
import subprocess
from flask_cors import CORS
import webbrowser
import socket

# Determine base/static folder depending on if running as a PyInstaller executable or script
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
    static_folder = os.path.join(BASE_DIR, "scenarioBuilder-frontend")
else:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    static_folder = os.path.abspath("../scenarioBuilder-frontend")

# Initialize Flask app
app = Flask(__name__, static_folder=static_folder, static_url_path="/scenarioBuilder-frontend")
app.config['SCENARIOS_FOLDER'] = 'scenarios'  # Directory to store saved games
os.makedirs(app.config['SCENARIOS_FOLDER'], exist_ok=True)  # Ensure folder exists

# Enable CORS (for cross-origin requests from frontend)
CORS(app)

# Endpoint to create and save a game config
@app.route('/create_game', methods=['POST'])
def create_game():
    data = request.json
    title = data['title'].replace(' ', '_')  # Sanitize filename
    filename = f"{app.config['SCENARIOS_FOLDER']}/{title}.json"

    config = data['config']
    config["DESCRIPTION"] = data.get("description", "").strip()  # Add description field

    # Save config as JSON file
    with open(filename, 'w') as f:
        json.dump(config, f, indent=4)

    return jsonify({"message": "Game saved successfully", "filename": filename})

# Endpoint to download a saved game JSON
@app.route('/export_json/<filename>', methods=['GET'])
def export_json(filename):
    filepath = os.path.join(app.config['SCENARIOS_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({"message": "File not found"}), 404

# Helper function to get an available local port
def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    _, port = s.getsockname()
    s.close()
    return port

port = get_free_port()

# Serve frontend index.html
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

# Serve static assets (CSS, JS, etc.)
@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# Start Flask server and open app in default browser
if __name__ == "__main__":
    webbrowser.open(f"http://127.0.0.1:{port}/scenarioBuilder-frontend/index.html")
    app.run(port=port)
