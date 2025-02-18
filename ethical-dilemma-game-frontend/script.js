const BASE_API_URL = "http://127.0.0.1:5000/api/game";

document.addEventListener("DOMContentLoaded", () => {
    getScenario();
});

// Display the scenario and start the game
async function getScenario() {
    try {
        const response = await fetch(`${BASE_API_URL}/get_scenario`);
        const data = await response.json();

        document.getElementById("story").textContent = data.story;
        document.getElementById("character").textContent = `Character: ${data.character}`;

        const startButton = document.createElement("button");
        startButton.textContent = "Start Game";
        startButton.onclick = function () {
            startButton.textContent = "Restart Game";
            startButton.dataset.started = "true";
            document.getElementById("dilemma-container").style.display = "block"; 
            document.getElementById("choices-container").style.display = "block";
            loadDilemma(0);
        };
        document.getElementById("game-info").appendChild(startButton);
    } catch (error) {
        console.error("Error fetching scenario:", error);
    }
}


// Load a dilemma
async function loadDilemma(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}`);
        if (!response.ok) throw new Error(`Dilemma ${index} not found`);
        const data = await response.json();

        document.getElementById("dilemma").textContent = data.Dilemma;

        getChoices(index);
    } catch (error) {
        console.error("Error fetching dilemma:", error);
    }
}

// Get the choices from a dilemma 
async function getChoices(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/get_choices`);
        if (!response.ok) throw new Error(`Choices for dilemma ${index} not found`);
        const data = await response.json();

        const choicesList = document.getElementById("choices-list");
        choicesList.innerHTML = "";

        data.choices.forEach(choice => {
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.textContent = choice.text;
            button.onclick = () => handleChoice(index, choice.id);
            li.appendChild(button);
            choicesList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching choices:", error);
    }
}

// Deal with the players choice
async function handleChoice(currentIndex, choiceId) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${currentIndex}/choice/${choiceId}/outcome`);
        if (!response.ok) throw new Error(`Error fetching outcome for dilemma ${currentIndex}`);
        
        const outcomeData = await response.json();

        if (!outcomeData || !outcomeData.outcome) {
            console.error("Outcome data not found.");
            return;
        }

        // Display the outcome of the choice
        document.getElementById("dilemma").textContent = outcomeData.outcome;
        document.getElementById("choices-list").innerHTML = "";

        // Check whether the choice is right or not
        if (outcomeData.next_dilemma != undefined) {
            const continueButton = document.createElement("button");
            continueButton.textContent = "Continue";
            
            // Load the next dilemma 
            continueButton.onclick = () => loadDilemma(outcomeData.next_dilemma);
            document.getElementById("choices-list").appendChild(continueButton);
        } else {
            // Incorrect choice or end of dilemmas, retry
            const retryButton = document.createElement("button");
            retryButton.textContent = "Try Again";

             // Reload the current dilemma
            retryButton.onclick = () => loadDilemma(currentIndex);
            document.getElementById("choices-list").appendChild(retryButton);
        }
    } catch (error) {
        console.error("Error handling choice:", error);
    }
}

