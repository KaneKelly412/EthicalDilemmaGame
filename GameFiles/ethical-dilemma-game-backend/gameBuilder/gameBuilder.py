from flask import Flask, send_from_directory, request, jsonify
import subprocess
import os

app = Flask(__name__, static_folder="templates")

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# Build the game using PyOxidizer
@app.route('/build', methods=['POST'])
def build():
    data = request.json
    target = data.get("target")

    if target == "windows":
        command = "pyoxidizer build --release --target-triple x86_64-pc-windows-msvc"
    elif target == "mac":
        command = "pyoxidizer build --release --target-triple x86_64-apple-darwin"
    else:
        return jsonify({"error": "Invalid target"}), 400

    try:
        process = subprocess.run(command, shell=True, capture_output=True, text=True)
        if process.returncode == 0:
            return jsonify({"status": "success", "output": process.stdout})
        else:
            return jsonify({"status": "error", "output": process.stderr}), 500
    except Exception as e:
        return jsonify({"status": "error", "output": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
