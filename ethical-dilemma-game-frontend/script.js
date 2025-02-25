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

        // Get the start button and set the initial functionality
        const startButton = document.getElementById("start-restart-button");
        startButton.textContent = "Start Game"; // Initialize button text
        
        // On button click, start the game
        startButton.onclick = async function () {
            startButton.style.display = "none"; // Hide the start button once clicked
            document.getElementById("dilemma-container").style.display = "block"; 
            document.getElementById("choices-container").style.display = "block";
            await loadDilemma(0); // Load the first dilemma
        };
    } catch (error) {
        console.error("Error fetching scenario:", error);
    }
}

// Load and display questions
async function getQuestions(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/get_questions`);
        if (!response.ok) throw new Error(`Questions for dilemma ${index} not found`);
        const data = await response.json();

        const questionsList = document.getElementById("questions-list");
        questionsList.innerHTML = ""; // Clear previous questions

        data.questions.forEach((q, idx) => {
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.textContent = q.question;
            button.classList.add("question-button");
            button.onclick = () => getAnswer(index, idx + 1);
            li.appendChild(button);
            questionsList.appendChild(li);
        });

        document.getElementById("questions-container").style.display = "block";
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

// Fetch and display the answer
async function getAnswer(index, questionId) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}/question/${questionId}`);
        if (!response.ok) throw new Error(`Answer for question ${questionId} not found`);
        const data = await response.json();

        document.getElementById("question-answer").textContent = `Answer: ${data.answer}`;
    } catch (error) {
        console.error("Error fetching answer:", error);
    }
}

// Modify loadDilemma to also load questions
async function loadDilemma(index) {
    try {
        const response = await fetch(`${BASE_API_URL}/dilemma/${index}`);
        if (!response.ok) throw new Error(`Dilemma ${index} not found`);
        const data = await response.json();

        document.getElementById("dilemma").textContent = data.Dilemma;

        getChoices(index);
        getQuestions(index);
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

        // Hide questions section
        document.getElementById("questions-container").style.display = "none";

        // Check whether the choice is correct or not
        if (outcomeData.next_dilemma != undefined) {
            const continueButton = document.createElement("button");
            continueButton.textContent = "Continue";
            
            // Load the next dilemma 
            continueButton.onclick = () => loadDilemma(outcomeData.next_dilemma);
            document.getElementById("choices-list").appendChild(continueButton);
        }
        
        else if (outcomeData.finish != undefined) {
            // Create and append finish message
            const finishMessage = document.createElement("p");
            finishMessage.innerHTML = `<strong></strong> ${outcomeData.finish}`;
            finishMessage.style.color = "green";
            finishMessage.style.fontWeight = "bold";
            finishMessage.style.marginTop = "20px";
            document.getElementById("dilemma-container").appendChild(finishMessage);  // Append to the dilemma container
        
            // Show a congratulations message
            const congratsMessage = document.createElement("p");
            congratsMessage.textContent = "🎉 Congratulations! You have completed the game.";
            congratsMessage.style.fontSize = "18px";
            congratsMessage.style.fontWeight = "bold";
            congratsMessage.style.color = "#007BFF";
            document.getElementById("dilemma-container").appendChild(congratsMessage);  // Append to the dilemma container
        
            // Create a restart button
            const restartButton = document.createElement("button");
            restartButton.textContent = "Restart Game";
            restartButton.onclick = async function () {
                await resetGame(); // Reset the game
            };

            document.getElementById("choices-list").appendChild(restartButton);
            
            
            return; // Stop execution since the game is over
        }
        
        
        else {
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

// Reset game logic
// Reset game logic
async function resetGame() {


        // Reset all UI elements to their initial state
        document.getElementById("story").textContent = "";
        document.getElementById("character").textContent = "";
        document.getElementById("dilemma").textContent = "";
        document.getElementById("choices-list").innerHTML = "";
        document.getElementById("questions-list").innerHTML = "";
        document.getElementById("question-answer").textContent = "";

        // Remove any finish messages or congrats message if they exist
        const finishMessages = document.querySelectorAll("#dilemma-container p, #dilemma-container strong");
        finishMessages.forEach(message => message.remove());

        // Ensure all sections are hidden
        document.getElementById("dilemma-container").style.display = "none";
        document.getElementById("choices-container").style.display = "none";
        document.getElementById("questions-container").style.display = "none";

        
        await getScenario();
}