const BASE_API_URL = window.location.origin; 

document.getElementById("addDilemma").addEventListener("click", function() {
    let dilemmasDiv = document.getElementById("dilemmas");
    let dilemmaIndex = dilemmasDiv.children.length; 

    let dilemmaDiv = document.createElement("div");
    dilemmaDiv.className = "dilemma";
    dilemmaDiv.dataset.id = dilemmaIndex; 

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
            updateDilemmaIds();
        }
    });

    let choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    let addChoiceBtn = document.createElement("button");
    addChoiceBtn.textContent = "Add Choice";

    let questionsDiv = document.createElement("div");
    questionsDiv.className = "questions";

    let addQuestionBtn = document.createElement("button");
    addQuestionBtn.textContent = "Add Question";

    // Add choice button logic
    addChoiceBtn.addEventListener("click", function() {
        let choiceDiv = document.createElement("div");
        choiceDiv.className = "choice";

        let choiceText = document.createElement("input");
        choiceText.placeholder = "Enter choice text";

        let outcomeText = document.createElement("input");
        outcomeText.placeholder = "Enter outcome text";

        let typeSelect = document.createElement("select");
        ["right", "wrong", "lose"].forEach(type => {
            let option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        let finishInput = document.createElement("input");
        finishInput.placeholder = "Enter finish message";
        finishInput.disabled = true;

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

        choiceDiv.appendChild(choiceText);
        choiceDiv.appendChild(outcomeText);
        choiceDiv.appendChild(typeSelect);
        choiceDiv.appendChild(finishInput);
        choiceDiv.appendChild(deleteChoiceBtn);
        choicesDiv.appendChild(choiceDiv);
    });

    // Add question button logic
    addQuestionBtn.addEventListener("click", function() {
        let questionDiv = document.createElement("div");
        questionDiv.className = "question";

        let questionText = document.createElement("input");
        questionText.placeholder = "Enter question text";

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

        questionDiv.appendChild(questionText);
        questionDiv.appendChild(answerText);
        questionDiv.appendChild(deleteQuestionBtn);
        questionsDiv.appendChild(questionDiv);
    });

    dilemmaDiv.appendChild(dilemmaInput);
    dilemmaDiv.appendChild(deleteDilemmaBtn);
    dilemmaDiv.appendChild(choicesDiv);
    dilemmaDiv.appendChild(addChoiceBtn);
    dilemmaDiv.appendChild(questionsDiv);
    dilemmaDiv.appendChild(addQuestionBtn);
    dilemmasDiv.appendChild(dilemmaDiv);
});

// Function to update dilemma IDs after deletion
function updateDilemmaIds() {
    document.querySelectorAll(".dilemma").forEach((dilemmaDiv, index) => {
        dilemmaDiv.dataset.id = index;
    });
}

// Save game logic
document.getElementById("saveGame").addEventListener("click", function() {
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    let story = document.getElementById("story").value.trim();
    let character = document.getElementById("character").value.trim();

    if (!title) {
        alert("Please enter a game title!");
        return;
    }

    let sanitizedFilename = title.replace(/\s+/g, "_") + ".json";

    let dilemmas = [];
    document.querySelectorAll(".dilemma").forEach((dilemmaDiv, index) => {
        let dilemmaText = dilemmaDiv.querySelector(".dilemma-text")?.value?.trim() || "";

        let choices = {};
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

        dilemmas.push({
            id: index, 
            DILEMMA: dilemmaText,
            CHOICES: choices,
            QUESTIONS: questions
        });
    });

    let gameData = {
        title: title,
        description: description,
        config: {
            STORY: story,
            CHARACTER: character,
            DILEMMAS: dilemmas
        }
    };

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

function downloadGame(filename) {
    let downloadUrl = `/export_json/${filename}`;
    let a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
 ``