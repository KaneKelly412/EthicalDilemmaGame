const BASE_API_URL = "http://127.0.0.1:5000/api/game";

document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
});

async function initializeGame() {
    try {
        await loadScenario(); // Load the initial scenario

        document.getElementById("next-scenario-button").addEventListener("click", async function () {
            await switchScenario();
        });
    } catch (error) {
        console.error("Error initializing game:", error);
    }
}

async function loadScenario() {
    try {
        const response = await fetch(`${BASE_API_URL}/get_scenario`);
        const data = await response.json();

        document.getElementById("story").textContent = data.story;
        document.getElementById("character").textContent = `Character: ${data.character}`;

        document.getElementById("start-restart-button").textContent = "Start Game";
        document.getElementById("start-restart-button").onclick = async function () {
            document.getElementById("start-restart-button").style.display = "none";
            document.getElementById("dilemma-container").style.display = "block";
            document.getElementById("choices-container").style.display = "block";
            await loadDilemma(0);
        };
    } catch (error) {
        console.error("Error fetching scenario:", error);
    }
}

async function switchScenario() {
    try {
        await fetch(`${BASE_API_URL}/next_scenario`, { method: "POST" });
        await loadScenario(); // Reload new scenario
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
            createButton("Continue", () => loadDilemma(outcomeData.next_dilemma), "choices-list");
        } else if (outcomeData.finish != undefined) {
            displayEndMessage(outcomeData.finish);
        } else {
            createButton("Try Again", () => loadDilemma(currentIndex), "choices-list");
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
}


function displayEndMessage(message) {
    const dilemmaContainer = document.getElementById("dilemma-container");
    const finishMessage = document.createElement("p");
    finishMessage.innerHTML = `<strong>${message}</strong>`;
    finishMessage.style.color = "green";
    finishMessage.style.fontWeight = "bold";
    finishMessage.style.marginTop = "20px";
    dilemmaContainer.appendChild(finishMessage);

    const congratsMessage = document.createElement("p");
    congratsMessage.textContent = "🎉 Congratulations! You have completed the game.";
    congratsMessage.style.fontSize = "18px";
    congratsMessage.style.fontWeight = "bold";
    congratsMessage.style.color = "#007BFF";
    dilemmaContainer.appendChild(congratsMessage);

    createButton("Restart Game", resetGame, "choices-list");
}

async function resetGame() {
    document.getElementById("story").textContent = "";
    document.getElementById("character").textContent = "";
    document.getElementById("dilemma").textContent = "";
    document.getElementById("choices-list").innerHTML = "";
    document.getElementById("questions-list").innerHTML = "";
    document.getElementById("question-answer").textContent = "";

    document.querySelectorAll("#dilemma-container p, #dilemma-container strong").forEach(el => el.remove());

    document.getElementById("dilemma-container").style.display = "none";
    document.getElementById("choices-container").style.display = "none";
    document.getElementById("questions-container").style.display = "none";

    await loadScenario(document.getElementById("scenario-selector").value);
}