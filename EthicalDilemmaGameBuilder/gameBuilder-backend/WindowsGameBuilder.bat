@echo off
cd /d "%~dp0"

echo Checking for required Python packages...
pip install -r requirements.txt

echo Starting the Flask app...
python app.py

pause