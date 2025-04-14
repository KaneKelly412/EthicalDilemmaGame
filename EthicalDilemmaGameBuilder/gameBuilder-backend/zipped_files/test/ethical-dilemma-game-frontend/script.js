// Base API endpoint for game-related requests
const BASE_API_URL = `${window.location.origin}/api/game`;

// Initial number of lives
let lives = 3;

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    initializeGame();

    // Make the reflection textarea auto-expand based on content
    const reflectionText = document.getElementById("reflection-text");
    reflectionText.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
});

// Initialize game setup and event listeners
async function initializeGame() {
    try {
        await loadScenario(); // Load initial story and character

        // Hide next scenario button by default and bind click handler
        document.getElementById("next-scenario-button").style.display = "none";
        document.getElementById("next-scenario-button").addEventListener("click", async function () {
            await switchScenario();
        });

        // Start button event listener
        const startButton = document.getElementById("start-button");
        if (startButton) {
            startButton.addEventListener("click", startGame);
        }

        // Show lives on screen
        updateLivesDisplay();
    } catch (error) {
        console.error("Error initializing game:", error);
    }
}

// Fetch and display the scenario (story and character)
async function loadScenario() {
    try {
        const response = await fetch(`${BASE_API_URL}/get_scenario`);
        const data = await response.json();

        // Populate story and character elements
        document.getElementById("story").textContent = data.story;
        document.getElementById("character").textContent = `ROLE: ${data.character}`;
    } catch (error) {
        console.error("Error fetching scenario:", error);
    }
}

// Move to next scenario or show the finish screen if game is over
async function switchScenario() {
    try {
        const response = await fetch(`${BASE_API_URL}/check_scenarios`, {method: "GET"});
        const data = await response.json();

        if (data.game_finished) {
            showFinishScreen(); // Game over
        } else {
            await fetch(`${BASE_API_URL}/next_scenario`, { method: "POST" });

            resetGame();   // Reset game UI
            loadScenario(); // Load next scenario
        }
    } catch (error) {
        console.error("Error switching scenarios:", error);
    }
}

// Load dilemma and its choices/questions for the current index
async function loadDilemma(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}`);
        if (!response.ok) throw new Error(`Dilemma ${index} not found`);

        const data = await response.json();
        document.getElementById("dilemma").textContent = data.Dilemma;

        await loadChoices(index);
        await loadQuestions(index);
    } catch (error) {
        console.error("Error loading dilemma:", error);
    }
}

// Load choices for the current dilemma and create buttons
async function loadChoices(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/get_choices`);
        if (!response.ok) throw new Error(`Choices for dilemma ${index} not found`);

        const data = await response.json();
        const choicesList = document.getElementById("choices-list");
        choicesList.innerHTML = ""; // Clear old choices

        data.choices.forEach(choice => {
            const button = document.createElement("button");
            button.textContent = choice.text;
            button.onclick = () => handleChoice(index, choice.id);
            choicesList.appendChild(button);
        });
    } catch (error) {
        console.error("Error loading choices:", error);
    }
}

// Load clarifying questions for the dilemma
async function loadQuestions(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/get_questions`);
        if (!response.ok) throw new Error(`Questions for dilemma ${index} not found`);

        const data = await response.json();
        const questionsList = document.getElementById("questions-list");
        questionsList.innerHTML = ""; // Clear old questions

        data.questions.forEach((q, idx) => {
            const button = document.createElement("button");
            button.textContent = q.question;
            button.onclick = () => loadAnswer(index, idx + 1);
            questionsList.appendChild(button);
        });

        document.getElementById("questions-container").style.display = "block";
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

// Load answer to a specific question
async function loadAnswer(index, questionId) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/question/${questionId}`);
        if (!response.ok) throw new Error(`Answer for question ${questionId} not found`);

        const data = await response.json();
        document.getElementById("question-answer").style.display = "block";
        document.getElementById("question-answer").textContent = `Answer: ${data.answer}`;
    } catch (error) {
        console.error("Error loading answer:", error);
    }
} 

// Handle the result of a selected choice
async function handleChoice(currentIndex, choiceId) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${currentIndex}/choice/${choiceId}/outcome`);
        if (!response.ok) throw new Error(`Error fetching outcome for dilemma ${currentIndex}`);

        const outcomeData = await response.json();
        document.getElementById("dilemma").textContent = outcomeData.outcome;
        document.getElementById("choices-list").innerHTML = "";
        document.getElementById("questions-container").style.display = "none";
        document.getElementById("question-answer").style.display = "none";

        // Navigate to next dilemma
        if (outcomeData.next_dilemma != undefined) {
            const continueButton = createButton("Continue", () => loadDilemma(outcomeData.next_dilemma), "choices-list");
        } 
        // Show final message
        else if (outcomeData.finish != undefined) {
            displayEndMessage(outcomeData.finish);
        } 
        // Incorrect choice logic
        else if (outcomeData.type == "wrong"){
            lives -= 1;
            updateLivesDisplay();

            if (lives > 0) {
                const tryAgainButton = createButton("Try Again", () => loadDilemma(currentIndex), "choices-list");    
            } else {
                displayFailureMessage("You have lost all lives. Game Over!");
                lives = 3;                
            }
        }
        // Immediate game over scenario
        else if (outcomeData.type == "lose") {
            lives = 0;
            updateLivesDisplay();
            displayFailureMessage("You have failed the scenario. Restarting...");
        }
    } catch (error) {
        console.error("Error handling choice:", error);
    }
}

// Utility to create a button and attach to a parent
function createButton(text, onClick, parentId) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onClick;
    const parentElement = document.getElementById(parentId);
    parentElement.appendChild(button);
    return button;
}

// Update the UI display of lives
function updateLivesDisplay() {
    const livesElement = document.getElementById("lives");
    livesElement.textContent = `❤️ Lives: ${lives}`;
}

// Display success message and restart option
function displayEndMessage(message) {
    const dilemmaContainer = document.getElementById("dilemma-container");

    const finishMessage = document.createElement("p");
    finishMessage.id = "finish-message";
    finishMessage.innerHTML = `<strong>${message}</strong>`;
    finishMessage.style.color = "green";
    finishMessage.style.fontWeight = "bold";
    finishMessage.style.marginTop = "20px";
    dilemmaContainer.appendChild(finishMessage);

    const congratsMessage = document.createElement("p");
    congratsMessage.id = "congrats-message";
    congratsMessage.textContent = "🎉 Congratulations! You have completed the game.";
    congratsMessage.style.fontSize = "18px";
    congratsMessage.style.fontWeight = "bold";
    congratsMessage.style.color = "#007BFF";
    dilemmaContainer.appendChild(congratsMessage);

    document.getElementById("next-scenario-button").style.display = "block";
    const restartButton = createButton("Restart Game", resetGame, "choices-list");
}

// Display failure message and restart button
function displayFailureMessage(message) {
    const dilemmaContainer = document.getElementById("dilemma-container");

    const failureMessage = document.createElement("p");
    failureMessage.id = "failure-message"
    failureMessage.innerHTML = `<strong>${message}</strong>`;
    failureMessage.style.color = "red";
    dilemmaContainer.appendChild(failureMessage);

    document.getElementById("next-scenario-button").style.display = "block";
    const restartButton = createButton("Restart Game", resetGame, "choices-list");
    restartButton.id = "restart-button";
}

// Begin the game from the first dilemma
async function startGame() {
    updateLivesDisplay();

    const restartButton = document.getElementById("restart-button");
    if (restartButton) {
        restartButton.style.display = "none";
    }

    const startButton = document.getElementById("start-button");
    if (startButton) {
        startButton.style.display = "none";
    }

    document.getElementById("next-scenario-button").style.display = "none";
    document.getElementById("dilemma-container").style.display = "block";
    document.getElementById("choices-container").style.display = "";
    document.getElementById("questions-container").style.display = "";

    let currentIndex = 0;
    loadDilemma(currentIndex);
}

// Reset game UI to its initial state
async function resetGame() {
    try {
        const finishMessage = document.getElementById("finish-message");
        const congratsMessage = document.getElementById("congrats-message");
        const failureMessage = document.getElementById("failure-message");

        if (finishMessage) finishMessage.remove();
        if (congratsMessage) congratsMessage.remove();
        if (failureMessage) failureMessage.remove();

        // Hide gameplay containers
        document.getElementById("dilemma-container").style.display = "none";
        document.getElementById("choices-container").style.display = "none";
        document.getElementById("questions-container").style.display = "none";
        document.getElementById("next-scenario-button").style.display = "none";

        currentIndex = 0;

        // Ensure "Start Game" button is available
        let startButton = document.getElementById("start-button");
        if (!startButton) {
            startButton = createButton("Start Game", () => startGame(), "choices-container");
            startButton.id = "start-button";
        } else {
            startButton.style.display = "block";
        }

        const restartButton = document.getElementById("restart-button");
        if (restartButton) {
            restartButton.style.display = "none";
        }

        lives = 3;
    } catch (error) {
        console.error("Error restarting game:", error);
    }
}

// Show the final screen with game summary and reflection
async function showFinishScreen() {
    // Hide all main game sections
    document.getElementById("lives").style.display = "none";
    document.getElementById("game-info").style.display = "none";
    document.getElementById("dilemma-container").style.display = "none";
    document.getElementById("choices-container").style.display = "none";
    document.getElementById("questions-container").style.display = "none";
    document.getElementById("next-scenario-button").style.display = "none";

    document.getElementById("finish-screen").style.display = "block";

    // Get game stats from backend
    const response = await fetch(`${BASE_API_URL}/finish`);
    const data = await response.json();

    // Show stats
    document.getElementById("stats").innerHTML = `
        <h2>Game Summary</h2>
        <p>Scenarios Completed: ${data.scenarios_completed}</p>
        <p>Total Lives Lost: ${data.total_lives_lost}</p>
        <p>Wrong Choices Made: ${data.wrong_choices_made}</p>
        <p>Failures: ${data.failures}<p>
    `;

    // Allow player to download reflection
    document.getElementById("download-reflection-button").addEventListener("click", downloadReflection);
}

// Download reflection and stats as a text file
function downloadReflection() {
    const reflectionText = document.getElementById("reflection-text").value;
    const statsText = document.getElementById("stats").innerText;

    const fileContent = `Game Reflection\n\n${statsText}\n\nPlayer Reflections:\n${reflectionText}`;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "game_reflection.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
