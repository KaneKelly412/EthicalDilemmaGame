#!/bin/bash

# Set the path to the bundled app
APP_PATH="./dist/app"  # Make sure this points to the actual path of the bundled executable

# Run the bundled app
echo "Running the game app..."
"$APP_PATH" &  # The "&" runs the app in the background

# Give the app a second or two to start up before opening the browser
sleep 2

# Open the browser to your game's URL (assuming your game runs on a local server)
echo "Opening the game in the browser..."
open http://localhost:5000  # Replace with your actual game URL and port
