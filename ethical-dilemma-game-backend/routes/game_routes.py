from flask import Blueprint, jsonify, request
import utils.helpers as helpers
import json

game_bp = Blueprint("game", __name__)



scenarios = helpers.load_json("config.json")

# Initialize game state
game_state = {
    #"current_scenario": scenarios["start"],
    "history": []
}

# API endpoint to get the current scenario
@game_bp.route("/get_scenario", methods=["GET"])
def get_scenario():
    return jsonify({
        "story" : scenarios["STORY"],
        "character" : scenarios["CHARACTER"]
    })


# API endpoint to reset the game
"""
@game_bp.route("/reset", methods=["POST"])
def reset_game():
    game_state["current_scenario"] = scenarios["start"]
    game_state["history"] = []
    return jsonify({"message": "Game reset successful", "scenario": game_state["current_scenario"]})
"""


# API endpoint to get current dilemma
@game_bp.route("/dilemma/<int:index>", methods=["GET"])
def get_dilemma(index):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404
    
    dilemma = scenarios["DILEMMAS"][index]["DILEMMA"]

    return jsonify({"Dilemma" : dilemma})


# API endpoint to get choices from a dilemma
@game_bp.route("/dilemma/<int:index>/get_choices", methods=["GET"])
def get_dilemma_choices(index):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404
    
    dilemma = scenarios["DILEMMAS"][index]

    # Iterate over the choices, which are now a dictionary, not a list
    choices = [{"id": int(choice_id), "text": choice["text"]} for choice_id, choice in dilemma["CHOICES"].items()]

    
    return jsonify({
        "choices": choices
    })



