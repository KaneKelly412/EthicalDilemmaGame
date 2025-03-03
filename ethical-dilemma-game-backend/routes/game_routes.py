from flask import Blueprint, jsonify, request
import utils.helpers as helpers
import os

game_bp = Blueprint("game", __name__)

# Load all scenario files from the Scenarios folder
SCENARIOS_DIR = os.path.join(os.path.dirname(__file__), "..", "Scenarios")
scenario_files = sorted([f for f in os.listdir(SCENARIOS_DIR) if f.startswith("Scenario") and f.endswith(".json")])

# Game state to track active scenario and progress
game_state = {
    "current_scenario_index": 0,
    "current_dilemma": 0,
    "history": []
}

def load_current_scenario():
    """Load the scenario file based on the current index"""
    scenario_path = os.path.join(SCENARIOS_DIR, scenario_files[game_state["current_scenario_index"]])
    return helpers.load_json(scenario_path)

scenarios = load_current_scenario()


# API endpoint to get the current scenario details
@game_bp.route("/get_scenario", methods=["GET"])
def get_scenario():
    global scenarios
    scenarios = load_current_scenario()
    return jsonify({
        "story": scenarios["STORY"],
        "character": scenarios["CHARACTER"]
    })


# API to switch to the next scenario
@game_bp.route("/next_scenario", methods=["POST"])
def next_scenario():
    if not scenario_files:
        return jsonify({"error": "No scenarios available"}), 404

    game_state["current_scenario_index"] = (game_state["current_scenario_index"] + 1) % len(scenario_files)
    game_state["current_dilemma"] = 0
    game_state["history"] = []

    global scenarios
    scenarios = load_current_scenario()  # Ensure fresh scenario is loaded

    return jsonify({
        "message": f"Switched to {scenario_files[game_state['current_scenario_index']]}",
        "story": scenarios["STORY"],
        "character": scenarios["CHARACTER"]
    })


# API to reset the game (optionally with a new scenario)
@game_bp.route("/reset", methods=["POST"])
def reset_game():
    game_state["current_dilemma"] = 0
    game_state["history"] = []

    global scenarios
    scenarios = load_current_scenario()  # Reload the scenario file

    return jsonify({"message": "Game reset successful"})



# API endpoint to get current dilemma
@game_bp.route("/dilemma/<int:index>", methods=["GET"])
def get_dilemma(index):
    global scenarios
    scenarios = load_current_scenario()  # Reload the scenario file

    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404
    
    return jsonify({"Dilemma": scenarios["DILEMMAS"][index]["DILEMMA"]})


# API endpoint to get choices from a dilemma
@game_bp.route("/dilemma/<int:index>/get_choices", methods=["GET"])
def get_dilemma_choices(index):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404
    
    dilemma = scenarios["DILEMMAS"][index]
    choices = [{"id": int(choice_id), "text": choice["text"]} for choice_id, choice in dilemma["CHOICES"].items()]

    return jsonify({"choices": choices})


# API endpoint to get questions from a dilemma
@game_bp.route("/dilemma/<int:index>/get_questions", methods=["GET"])
def get_dilemma_questions(index):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404
    
    questions = [{"question": q["question"]} for q in scenarios["DILEMMAS"][index]["QUESTIONS"]]

    return jsonify({"questions": questions})


# API endpoint to get answer from a question
@game_bp.route("/dilemma/<int:index>/question/<int:question_id>", methods=["GET"])
def get_dilemma_answer(index, question_id):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404

    question = next((q for q in scenarios["DILEMMAS"][index]["QUESTIONS"] if q["id"] == question_id), None)
    if not question:
        return jsonify({"error": "Question not found"}), 404

    return jsonify({"question": question["question"], "answer": question["answer"]})


# API endpoint to get the outcome of a specific choice
@game_bp.route("/dilemma/<int:dilemma_id>/choice/<int:choice_id>/outcome", methods=["GET"])
def get_choice_outcome(dilemma_id, choice_id):
    if dilemma_id < 0 or dilemma_id >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404

    choices = scenarios["DILEMMAS"][dilemma_id].get("CHOICES", {})
    choice = choices.get(str(choice_id))
    if not choice:
        return jsonify({"error": "Invalid choice"}), 404

    return jsonify({
        "outcome": choice.get("outcome", "No outcome provided."),
        "next_dilemma": choice.get("next_dilemma"),
        "finish": choice.get("finish"),
        "type": choice.get("type")
    })
