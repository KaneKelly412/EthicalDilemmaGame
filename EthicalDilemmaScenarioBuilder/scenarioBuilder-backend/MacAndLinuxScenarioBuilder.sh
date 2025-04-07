#!/bin/bash
cd "$(dirname "$0")"

echo "Checking for required Python packages..."
pip3 install -r requirements.txt

echo "Starting the Flask app..."
python3 app.py