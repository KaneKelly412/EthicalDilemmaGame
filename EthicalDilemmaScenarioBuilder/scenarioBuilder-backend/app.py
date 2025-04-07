from flask import Flask, request, jsonify, send_file, send_from_directory
import json
import os
import sys
import subprocess
from flask_cors import CORS
import webbrowser
import socket




if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
    static_folder = os.path.join(BASE_DIR, "scenarioBuilder-frontend")
else:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    static_folder = os.path.abspath("../scenarioBuilder-frontend")

app = Flask(__name__, static_folder=static_folder, static_url_path="/scenarioBuilder-frontend")
app.config['SCENARIOS_FOLDER'] = 'scenarios'
os.makedirs(app.config['SCENARIOS_FOLDER'], exist_ok=True)


CORS(app)

@app.route('/create_game', methods=['POST'])
def create_game():
    data = request.json
    filename = f"{app.config['SCENARIOS_FOLDER']}/{data['title'].replace(' ', '_')}.json"
    
    with open(filename, 'w') as f:
        json.dump(data['config'], f, indent=4)
    
    return jsonify({"message": "Game saved successfully", "filename": filename})

@app.route('/export_json/<filename>', methods=['GET'])
def export_json(filename):
    filepath = os.path.join(app.config['SCENARIOS_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({"message": "File not found"}), 404



def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    _, port = s.getsockname()
    s.close()
    return port

port = get_free_port()

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    webbrowser.open(f"http://127.0.0.1:{port}/scenarioBuilder-frontend/index.html")  # Open the correct Flask URL
    app.run(port=port)
