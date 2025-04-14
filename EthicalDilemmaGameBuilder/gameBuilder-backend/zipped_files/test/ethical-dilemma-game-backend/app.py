import os
import sys
import json
import socket
import webbrowser
import subprocess
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from routes.game_routes import game_bp
import utils.helpers as helpers

# Handle Paths for PyInstaller or Development Mode
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS  # PyInstaller bundled location
    static_folder = os.path.join(BASE_DIR, "ethical-dilemma-game-frontend")
else:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    static_folder = os.path.abspath("../ethical-dilemma-game-frontend")

# Initialize Flask App
app = Flask(__name__, static_folder=static_folder, static_url_path="/ethical-dilemma-game-frontend")
CORS(app)
app.register_blueprint(game_bp, url_prefix="/api/game")

# Serve the frontend index.html
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# Dynamic Free Port Finder
def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    _, port = s.getsockname()
    s.close()
    return port

# Run the Flask App and Open Browser
if __name__ == "__main__":
    port = get_free_port()
    webbrowser.open(f"http://127.0.0.1:{port}/ethical-dilemma-game-frontend/index.html")
    app.run(port=port, debug=False)
