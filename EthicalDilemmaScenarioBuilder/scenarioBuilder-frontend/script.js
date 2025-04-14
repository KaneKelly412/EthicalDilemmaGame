// Base API URL derived from current site origin
const BASE_API_URL = window.location.origin; 

// Event listener for adding a new dilemma
document.getElementById("addDilemma").addEventListener("click", function() {
    let dilemmasDiv = document.getElementById("dilemmas");
    let dilemmaIndex = dilemmasDiv.children.length; 

    // Create main dilemma container
    let dilemmaDiv = document.createElement("div");
    dilemmaDiv.className = "dilemma";
    dilemmaDiv.dataset.id = dilemmaIndex; 

    // Dilemma input field
    let dilemmaInput = document.createElement("input");
    dilemmaInput.placeholder = "Enter dilemma text";
    dilemmaInput.className = "dilemma-text";

    // Delete dilemma button
    let deleteDilemmaBtn = document.createElement("button");
    deleteDilemmaBtn.textContent = "❌";
    deleteDilemmaBtn.className = "delete-btn";
    deleteDilemmaBtn.addEventListener("click", function() {
        if (confirm("Are you sure you want to delete this dilemma?")) {
            dilemmaDiv.remove();
            updateDilemmaIds(); // Re-index remaining dilemmas
        }
    });

    // Container for choices
    let choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    // Button to add a new choice
    let addChoiceBtn = document.createElement("button");
    addChoiceBtn.textContent = "Add Choice";

    // Container for questions
    let questionsDiv = document.createElement("div");
    questionsDiv.className = "questions";

    // Button to add a new clarifying question
    let addQuestionBtn = document.createElement("button");
    addQuestionBtn.textContent = "Add Clarifying Question";

    // Add new choice logic
    addChoiceBtn.addEventListener("click", function() {
        let choiceDiv = document.createElement("div");
        choiceDiv.className = "choice";

        // Choice text and outcome fields
        let choiceText = document.createElement("input");
        choiceText.placeholder = "Enter choice text";

        let outcomeText = document.createElement("input");
        outcomeText.placeholder = "Enter outcome text";

        // Choice type selector
        let typeSelect = document.createElement("select");
        ["right", "wrong", "lose"].forEach(type => {
            let option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        // Optional finish message input (enabled only if type is "right")
        let finishInput = document.createElement("input");
        finishInput.placeholder = "Enter finish message";
        finishInput.disabled = true;

        // Toggle finishInput based on type
        typeSelect.addEventListener("change", function() {
            finishInput.disabled = typeSelect.value !== "right";
            if (finishInput.disabled) finishInput.value = "";
        });

        // Delete choice button
        let deleteChoiceBtn = document.createElement("button");
        deleteChoiceBtn.textContent = "❌";
        deleteChoiceBtn.className = "delete-btn";
        deleteChoiceBtn.addEventListener("click", function() {
            if (confirm("Are you sure you want to delete this choice?")) {
                choiceDiv.remove();
            }
        });

        // Add elements to choice container
        choiceDiv.appendChild(choiceText);
        choiceDiv.appendChild(outcomeText);
        choiceDiv.appendChild(typeSelect);
        choiceDiv.appendChild(finishInput);
        choiceDiv.appendChild(deleteChoiceBtn);
        choicesDiv.appendChild(choiceDiv);
    });

    // Add new question logic
    addQuestionBtn.addEventListener("click", function() {
        let questionDiv = document.createElement("div");
        questionDiv.className = "question";

        // Question and answer input fields
        let questionText = document.createElement("input");
        questionText.placeholder = "Enter clarifying question text";

        let answerText = document.createElement("input");
        answerText.placeholder = "Enter answer text";

        // Delete question button
        let deleteQuestionBtn = document.createElement("button");
        deleteQuestionBtn.textContent = "❌";
        deleteQuestionBtn.className = "delete-btn";
        deleteQuestionBtn.addEventListener("click", function() {
            if (confirm("Are you sure you want to delete this question?")) {
                questionDiv.remove();
            }
        });

        // Add elements to question container
        questionDiv.appendChild(questionText);
        questionDiv.appendChild(answerText);
        questionDiv.appendChild(deleteQuestionBtn);
        questionsDiv.appendChild(questionDiv);
    });

    // Append all components to the dilemma
    dilemmaDiv.appendChild(dilemmaInput);
    dilemmaDiv.appendChild(deleteDilemmaBtn);
    dilemmaDiv.appendChild(choicesDiv);
    dilemmaDiv.appendChild(addChoiceBtn);
    dilemmaDiv.appendChild(questionsDiv);
    dilemmaDiv.appendChild(addQuestionBtn);
    dilemmasDiv.appendChild(dilemmaDiv);
});

// Reassigns dilemma dataset IDs after one is removed
function updateDilemmaIds() {
    document.querySelectorAll(".dilemma").forEach((dilemmaDiv, index) => {
        dilemmaDiv.dataset.id = index;
    });
}

// Save game button logic
document.getElementById("saveGame").addEventListener("click", function() {
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    let story = document.getElementById("story").value.trim();
    let character = document.getElementById("character").value.trim();

    // Title is required
    if (!title) {
        alert("Please enter a game title!");
        return;
    }

    // Prepare filename for saving
    let sanitizedFilename = title.replace(/\s+/g, "_") + ".json";

    let dilemmas = [];
    // Gather data from all dilemmas
    document.querySelectorAll(".dilemma").forEach((dilemmaDiv, index) => {
        let dilemmaText = dilemmaDiv.querySelector(".dilemma-text")?.value?.trim() || "";

        let choices = {};
        // Extract all choices
        dilemmaDiv.querySelectorAll(".choice").forEach((choiceDiv, i) => {
            let inputs = choiceDiv.querySelectorAll("input, select");

            if (inputs.length < 4) return;

            let choiceText = inputs[0].value.trim();
            let outcomeText = inputs[1].value.trim();
            let choiceType = inputs[2].value;
            let finishText = inputs[3].value.trim();

            choices[i + 1] = {
                text: choiceText,
                outcome: outcomeText
            };

            // Handle "right" choice differently
            if (choiceType === "right") {
                if (finishText) {
                    choices[i + 1].finish = finishText;
                } else {
                    choices[i + 1].next_dilemma = index + 1;
                }
            } else {
                choices[i + 1].type = choiceType;
            }
        });

        let questions = [];
        // Extract all questions
        dilemmaDiv.querySelectorAll(".question").forEach((questionDiv, i) => {
            let inputs = questionDiv.querySelectorAll("input");
            if (inputs.length < 2) return;

            let questionText = inputs[0].value.trim();
            let answerText = inputs[1].value.trim();

            questions.push({
                id: i + 1,
                question: questionText,
                answer: answerText
            });
        });

        // Assemble full dilemma object
        dilemmas.push({
            id: index, 
            DILEMMA: dilemmaText,
            CHOICES: choices,
            QUESTIONS: questions
        });
    });

    // Full game object
    let gameData = {
        title: title,
        description: description,
        config: {
            STORY: story,
            CHARACTER: character,
            DILEMMAS: dilemmas
        }
    };

    // Send game data to backend
    fetch(`${BASE_API_URL}/create_game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Game saved successfully!");
        downloadGame(sanitizedFilename);
    })
    .catch(error => alert("Error saving game"));
});

// Trigger download of saved game JSON
function downloadGame(filename) {
    let downloadUrl = `/export_json/${filename}`;
    let a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

