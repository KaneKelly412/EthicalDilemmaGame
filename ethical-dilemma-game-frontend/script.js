const BASE_API_URL = "http://127.0.0.1:5000/api/game";
let lives = 3;

document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
});

async function initializeGame() {
    try {
        await loadScenario(); // Load the initial scenario

        createButton("Next Scenario", switchScenario(), "choices-list");
        document.getElementById("next-scenario-button").style.display = "none";
        document.getElementById("next-scenario-button").addEventListener("click", async function () {
            await switchScenario();
        });

        const startButton = document.getElementById("start-button");
        if (startButton) {
            startButton.addEventListener("click", startGame);
        }

        updateLivesDisplay();
    } catch (error) {
        console.error("Error initializing game:", error);
    }
}

async function loadScenario() {
    try {
        const response = await fetch(`${BASE_API_URL}/get_scenario`);
        const data = await response.json();

        // Set story and character
        document.getElementById("story").textContent = data.story;
        document.getElementById("character").textContent = `Character: ${data.character}`;

        

    } catch (error) {
        console.error("Error fetching scenario:", error);
    }
}


async function switchScenario() {
    try {
        await fetch(`${BASE_API_URL}/next_scenario`, { method: "POST" });
        resetGame();
        //await startGame(); // Reload new scenario
    } catch (error) {
        console.error("Error switching scenarios:", error);
    }
}


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

async function loadChoices(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/get_choices`);
        if (!response.ok) throw new Error(`Choices for dilemma ${index} not found`);

        const data = await response.json();
        const choicesList = document.getElementById("choices-list");
        choicesList.innerHTML = "";

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

async function loadQuestions(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/get_questions`);
        if (!response.ok) throw new Error(`Questions for dilemma ${index} not found`);

        const data = await response.json();
        const questionsList = document.getElementById("questions-list");
        questionsList.innerHTML = "";

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

async function loadAnswer(index, questionId) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/question/${questionId}`);
        if (!response.ok) throw new Error(`Answer for question ${questionId} not found`);

        const data = await response.json();
        document.getElementById("question-answer").textContent = `Answer: ${data.answer}`;
    } catch (error) {
        console.error("Error loading answer:", error);
    }
}

async function handleChoice(currentIndex, choiceId) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${currentIndex}/choice/${choiceId}/outcome`);
        if (!response.ok) throw new Error(`Error fetching outcome for dilemma ${currentIndex}`);

        const outcomeData = await response.json();
        document.getElementById("dilemma").textContent = outcomeData.outcome;
        document.getElementById("choices-list").innerHTML = "";
        document.getElementById("questions-container").style.display = "none";

        if (outcomeData.next_dilemma != undefined) {
            const continueButton = createButton("Continue", () => loadDilemma(outcomeData.next_dilemma), "choices-list");
        } 
        else if (outcomeData.finish != undefined) {
            displayEndMessage(outcomeData.finish);
        } 
        else if (outcomeData.type == "wrong"){
            lives -= 1;
            updateLivesDisplay();

            if (lives > 0) {
                const tryAgainButton = createButton("Try Again", () => loadDilemma(currentIndex), "choices-list");    
            }
            else {
                displayFailureMessage("You have lost all lives. Game Over!");
                lives = 3;
                
                
            }
        }
        else if (outcomeData.type == "lose") {
            lives = 0;
            updateLivesDisplay();
            displayFailureMessage("You have failed the scenario. Restarting...");
        }
    } catch (error) {
        console.error("Error handling choice:", error);
    }
}

function createButton(text, onClick, parentId) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onClick;
    const parentElement = document.getElementById(parentId);
    parentElement.appendChild(button);
    return button;
}

function updateLivesDisplay() {
    const livesElement = document.getElementById("lives");
    livesElement.textContent = `❤️ Lives: ${lives}`;
}

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
    document.getElementById("dilemma-container").style.display = "block";
    document.getElementById("choices-container").style.display = "";
    document.getElementById("questions-container").style.display = "";
    document.getElementById("next-scenario-button").style.display = "";
    loadDilemma(currentIndex);
}

async function resetGame() {
    try {
        
        const finishMessage = document.getElementById("finish-message");
        const congratsMessage = document.getElementById("congrats-message");
        const failureMessage = document.getElementById("failure-message");

        if (finishMessage) finishMessage.remove();
        if (congratsMessage) congratsMessage.remove();
        if (failureMessage) failureMessage.remove();


        // Reset the visibility of sections
        document.getElementById("dilemma-container").style.display = "none";
        //document.getElementById("choices-container").style.display = "none";
        document.getElementById("questions-container").style.display = "none";
        document.getElementById("next-scenario-button").style.display = "none";

        // Remove dynamically added messages
        //document.querySelectorAll("#dilemma-container p, #dilemma-container strong").forEach(el => el.remove());

        currentIndex = 0;
        // Ensure only one "Start Game" button exists
        let startButton = document.getElementById("start-button");
        if (!startButton) {
            startButton = createButton("Start Game", () => startGame(), "choices-container");
            startButton.id = "start-button";
        } else {
            startButton.style.display = "block"; // Ensure visibility
        }
        const restartButton = document.getElementById("restart-button");
        if (restartButton) {
            restartButton.style.display = "none";
        }
        lives = 3;
        
        // Reload the scenario and ensure dilemma-container is ready

        // Ensure the dilemma container is visible before the next dilemma is loaded
        //document.getElementById("dilemma-container").style.display = "block";
        //document.getElementById("choices-container").style.display = "block";

    } catch (error) {
        console.error("Error restarting game:", error);
    }
}



