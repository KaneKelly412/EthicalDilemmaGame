from flask import Flask, request, jsonify, send_file
import json
import os
import subprocess
from flask_cors import CORS


app = Flask(__name__)
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

@app.route('/build_exe/<filename>', methods=['POST'])
def build_exe(filename):
    json_filepath = os.path.join(app.config['SCENARIOS_FOLDER'], filename)
    if not os.path.exists(json_filepath):
        return jsonify({"message": "File not found"}), 404
    
    script_content = f"""
import json
with open('{json_filepath}', 'r') as f:
    game_data = json.load(f)
print("Starting game:", game_data['STORY'])
"""
    script_filename = json_filepath.replace('.json', '.py')
    
    with open(script_filename, 'w') as f:
        f.write(script_content)
    
    subprocess.run(["pyinstaller", "--onefile", script_filename])
    exe_filename = f"dist/{os.path.basename(script_filename).replace('.py', '.exe')}"
    
    return send_file(exe_filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
