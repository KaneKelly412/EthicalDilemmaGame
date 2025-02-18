from flask import Blueprint, jsonify, request
import utils.helpers as helpers
import json

game_bp = Blueprint("game", __name__)



scenarios = helpers.load_json("config.json")

# Initialize game state
game_state = {
    "current_dilemma": 0,
    "history": []
}

# API endpoint to get the current scenario
@game_bp.route("/get_scenario", methods=["GET"])
def get_scenario():
    return jsonify({
        "story" : scenarios["STORY"],
        "character" : scenarios["CHARACTER"]
    })


# API to reset game
@game_bp.route("/reset", methods=["POST"])
def reset_game():
    game_state["current_dilemma"] = 0
    game_state["history"] = []
    return jsonify({"message": "Game reset successful"})



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

    choices = [{"id": int(choice_id), "text": choice["text"]} for choice_id, choice in dilemma["CHOICES"].items()]

    
    return jsonify({
        "choices": choices
    })

# API endpoint to get questions from a dilemma
@game_bp.route("/dilemma/<int:index>/get_questions", methods=["GET"])
def get_dilemma_questions(index):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404
    
    dilemma = scenarios["DILEMMAS"][index]

    questions =  [{"question": question["question"]} for question in dilemma["QUESTIONS"]]

    return jsonify({
        "questions": questions
    })

# API endpoint to get answer from a question
@game_bp.route("/dilemma/<int:index>/question/<int:question_id>", methods=["GET"])
def get_dilemma_answer(index, question_id):
    if index < 0 or index >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404

    dilemma = scenarios["DILEMMAS"][index]

    # Find the question with the matching ID
    question = next((q for q in dilemma["QUESTIONS"] if q["id"] == question_id), None)

    if not question:
        return jsonify({"error": "Question not found"}), 404

    return jsonify({
        "question": question["question"],
        "answer": question["answer"]
    })


# API endpoint to get the outcome of a specific choice
@game_bp.route("/dilemma/<int:dilemma_id>/choice/<int:choice_id>/outcome", methods=["GET"])
def get_choice_outcome(dilemma_id, choice_id):
    if dilemma_id < 0 or dilemma_id >= len(scenarios["DILEMMAS"]):
        return jsonify({"error": "Invalid dilemma index"}), 404

    dilemma = scenarios["DILEMMAS"][dilemma_id]
    choices = dilemma.get("CHOICES", {})

    choice = choices.get(str(choice_id))
    if not choice:
        return jsonify({"error": "Invalid choice"}), 404

    return jsonify({
        "outcome": choice.get("outcome", "No outcome provided."),
        "next_dilemma": choice.get("next_dilemma")
    })









