import json
import os

# Function to load JSON config files
def load_json(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Config file {file_path} not found")
    
    with open(file_path, "r") as file:
        return json.load(file)
    

def show_choices(dilemma):
    for i, choice in enumerate(dilemma["CHOICES"], start=1):
        print(f"{i}. {choice['TEXT']}")
