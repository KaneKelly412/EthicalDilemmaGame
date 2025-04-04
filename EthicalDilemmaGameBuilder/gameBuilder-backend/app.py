import os
import sys
import shutil  # Ensure shutil is imported
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import socket
import webbrowser
import subprocess

# Get the base directory of the current script (gameBuilder-backend)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Define paths relative to gameBuilder-backend
GAME_FILES_DIR = os.path.abspath(os.path.join(BASE_DIR, "../..", "GameFiles"))
BACKEND_DIR = os.path.join(GAME_FILES_DIR, "ethical-dilemma-game-backend")
ZIP_PATH = os.path.join(BASE_DIR, "game_files.zip")

# Initialize Flask App
app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "../gameBuilder-frontend"), static_url_path="/gameBuilder-frontend")
CORS(app)

# Route to zip game files
@app.route("/zip", methods=["POST"])
def zip_game_files():
    # Get the filename from the query parameter (default is 'game_files.zip')
    filename = request.args.get("filename", "game_files.zip")

    # Define the path where the zip file will be created
    zip_dir = os.path.join(BASE_DIR, "zipped_files")
    
    # Ensure the directory exists
    if not os.path.exists(zip_dir):
        os.makedirs(zip_dir)

    # Define the full path for the zip file
    zip_path_with_name = os.path.join(zip_dir, filename)  # Append '.zip' to the filename

    # Check if GameFiles directory exists
    if not os.path.exists(GAME_FILES_DIR):
        return jsonify({"error": f"GameFiles directory not found at {GAME_FILES_DIR}"}), 404

    # Delete the old zip if it exists
    if os.path.exists(zip_path_with_name):
        os.remove(zip_path_with_name)

    # Create the zip file in the zipped_files directory
    shutil.make_archive(zip_path_with_name.replace(".zip", ""), 'zip', GAME_FILES_DIR)

    # Log the file path to confirm it's created
    print(f"Zip file created at: {zip_path_with_name}")

    # Return success message
    return jsonify({"message": f"Zip file created successfully at {zip_path_with_name}"})


# Route to build the game executable
@app.route("/build", methods=["POST"])
def build_executable():
    if not os.path.exists(BACKEND_DIR):
        return jsonify({"error": f"Backend directory not found at {BACKEND_DIR}"}), 404

    command = [
        "pyinstaller", "--onefile",
        "--add-data", "Scenarios:Scenarios",
        "--add-data", "../ethical-dilemma-game-frontend:ethical-dilemma-game-frontend",
        "--add-data", "routes:routes",
        "--add-data", "utils:utils",
        "-n", "Game", "app.py"
    ]

    try:
        subprocess.run(command, cwd=BACKEND_DIR, check=True)
        return jsonify({"message": "Build successful!"})
    except subprocess.CalledProcessError:
        return jsonify({"error": "Build failed!"}), 500

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
    url = f"http://127.0.0.1:{port}/gameBuilder-frontend/index.html"
    webbrowser.open(url)
    app.run(port=port, debug=False)
