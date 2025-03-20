const BASE_API_URL = "http://127.0.0.1:5000";

document.getElementById("addDilemma").addEventListener("click", function() {
    let dilemmasDiv = document.getElementById("dilemmas");
    let dilemmaIndex = dilemmasDiv.children.length; // Auto-increment dilemma index

    let dilemmaDiv = document.createElement("div");
    dilemmaDiv.className = "dilemma";

    let dilemmaInput = document.createElement("input");
    dilemmaInput.placeholder = "Enter dilemma text";
    dilemmaInput.className = "dilemma-text";

    let choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    let addChoiceBtn = document.createElement("button");
    addChoiceBtn.textContent = "Add Choice";

    let questionsDiv = document.createElement("div");
    questionsDiv.className = "questions";

    let addQuestionBtn = document.createElement("button");
    addQuestionBtn.textContent = "Add Question";

    // 🟢 Add choice button logic
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

        // 🔹 Finish message input (disabled by default)
        let finishInput = document.createElement("input");
        finishInput.placeholder = "Enter finish message";
        finishInput.disabled = true; // Disabled unless type is "right"

        // 🟢 Auto-enable finish message when "right" is selected
        typeSelect.addEventListener("change", function() {
            if (typeSelect.value === "right") {
                finishInput.disabled = false;
            } else {
                finishInput.disabled = true;
                finishInput.value = ""; // Clear input if not "right"
            }
        });

        choiceDiv.appendChild(choiceText);
        choiceDiv.appendChild(outcomeText);
        choiceDiv.appendChild(typeSelect);
        choiceDiv.appendChild(finishInput);
        choicesDiv.appendChild(choiceDiv);
    });

    // 🟢 Add question button logic
    addQuestionBtn.addEventListener("click", function() {
        let questionDiv = document.createElement("div");
        questionDiv.className = "question";

        let questionText = document.createElement("input");
        questionText.placeholder = "Enter question text";

        let answerText = document.createElement("input");
        answerText.placeholder = "Enter answer text";

        questionDiv.appendChild(questionText);
        questionDiv.appendChild(answerText);
        questionsDiv.appendChild(questionDiv);
    });

    dilemmaDiv.appendChild(dilemmaInput);
    dilemmaDiv.appendChild(choicesDiv);
    dilemmaDiv.appendChild(addChoiceBtn);
    dilemmaDiv.appendChild(questionsDiv);
    dilemmaDiv.appendChild(addQuestionBtn);
    dilemmasDiv.appendChild(dilemmaDiv);
});

// 🟢 Save game logic
document.getElementById("saveGame").addEventListener("click", function() {
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    let story = document.getElementById("story").value.trim();
    let character = document.getElementById("character").value.trim();

    if (!title) {
        alert("Please enter a game title!");
        return;
    }

    let sanitizedFilename = title.replace(/\s+/g, "_") + ".json";  // Convert title to a filename

    let dilemmas = [];
    document.querySelectorAll(".dilemma").forEach((dilemmaDiv, index) => {
        let dilemmaText = dilemmaDiv.querySelector(".dilemma-text")?.value?.trim() || "";

        let choices = {};
        let choiceElements = dilemmaDiv.querySelectorAll(".choice");
        choiceElements.forEach((choiceDiv, i) => {
            let inputs = choiceDiv.querySelectorAll("input, select");

            if (inputs.length < 4) {
                console.warn(`Skipping choice ${i + 1} - Not enough inputs found.`);
                return;
            }

            let choiceText = inputs[0].value.trim();
            let outcomeText = inputs[1].value.trim();
            let choiceType = inputs[2].value;
            let finishText = inputs[3].value.trim(); // Get finish message

            choices[i + 1] = {
                text: choiceText,
                outcome: outcomeText
            };

            if (choiceType === "right") {
                if (finishText) {
                    choices[i + 1].finish = finishText; // Only add finish text
                } else {
                    choices[i + 1].next_dilemma = index + 1; // Add next dilemma only if no finish
                }
            } else {
                choices[i + 1].type = choiceType;
            }
        });

        let questions = [];
        let questionElements = dilemmaDiv.querySelectorAll(".question");
        questionElements.forEach((questionDiv, i) => {
            let inputs = questionDiv.querySelectorAll("input");

            if (inputs.length < 2) {
                console.warn(`Skipping question ${i + 1} - Not enough inputs found.`);
                return;
            }

            let questionText = inputs[0].value.trim();
            let answerText = inputs[1].value.trim();

            questions.push({
                id: i + 1,
                question: questionText,
                answer: answerText
            });
        });

        dilemmas.push({
            id: index, // First dilemma is 0, then auto-increments
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
