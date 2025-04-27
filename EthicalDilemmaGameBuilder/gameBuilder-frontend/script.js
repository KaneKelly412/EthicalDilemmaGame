const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const browseFiles = document.getElementById("browseFiles");
const fileList = document.getElementById("fileList");
const uploadStatus = document.getElementById("uploadStatus");

// Handle "Zip Files" button click
document.getElementById("zipButton").addEventListener("click", async () => {
    const status = document.getElementById("status");
    const zipName = document.getElementById("zipNameInput").value || "game_files.zip"; // Default zip name

    status.textContent = "Zipping files...";

    try {
        // Send POST request to trigger zipping on the server
        const response = await fetch(`/zip?filename=${encodeURIComponent(zipName)}`, { method: "POST" });
        const data = await response.json();

        if (response.ok) {
            status.textContent = "Game files zipped successfully!";
            uploadedFiles = [];
            renderFileList(); // This clears the UI list
        } else {
            status.textContent = `Error: ${data.error || 'Unknown error'}`;
        }
    } catch (error) {
        // Handle network or server errors
        status.textContent = "Error zipping files.";
    }
});

// Handle "Build Executable" button click
document.getElementById("buildButton").addEventListener("click", async () => {
    const status = document.getElementById("status");
    status.textContent = "Building executable...";

    try {
        // Send POST request to trigger build process on the server
        const response = await fetch("/build", { method: "POST" });
        const data = await response.json();
        status.textContent = data.message; // Display server response
    } catch (error) {
        // Handle network or server errors
        status.textContent = "Error building executable.";
    }
});

// Trigger file browser
browseFiles.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => handleFiles(Array.from(e.target.files)));
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "green";
});
dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#ccc";
});
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith(".json"));
    handleFiles(files);
});

// Array to store uploaded files
let uploadedFiles = [];

// Handles the files selected by the user
function handleFiles(files) {
    // If no files are selected, exit the function
    if (files.length === 0) return;

    // Add each file to the uploadedFiles array and start uploading
    files.forEach(file => {
        uploadedFiles.push(file);
        uploadFile(file);
    });

    // Update the file list display
    renderFileList();
}

// Renders the list of uploaded files in the UI
function renderFileList() {
    // Clear the current list
    fileList.innerHTML = "";

    // Create a list item for each uploaded file
    uploadedFiles.forEach((file, index) => {
        const li = document.createElement("li");
        li.textContent = file.name;

        // Create a remove button for the file
        const removeBtn = document.createElement("span");
        removeBtn.textContent = "✖";
        removeBtn.classList.add("remove-btn");

        // Remove the file from the list when the button is clicked
        removeBtn.onclick = async () => {
            const confirmDelete = confirm(`Are you sure you want to delete "${file.name}"?`);
            if (!confirmDelete) return;
        
            try {
                const res = await fetch(`/delete-scenario?filename=${encodeURIComponent(file.name)}`, {
                    method: "POST"
                });
                const data = await res.json();
        
                if (res.ok) {
                    uploadedFiles.splice(index, 1);
                    renderFileList();
                    uploadStatus.textContent = `"${file.name}" deleted successfully.`;
                } else {
                    uploadStatus.textContent = `Failed to delete ${file.name}: ${data.error}`;
                }
            } catch (err) {
                console.error(err);
                uploadStatus.textContent = `Error deleting ${file.name}.`;
            }
        };
        

        // Add the remove button to the list item and display it
        li.appendChild(removeBtn);
        fileList.appendChild(li);
    });
}

// Uploads a single file to the server
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("files", file);

    // Show uploading status
    uploadStatus.textContent = `Uploading ${file.name}...`;

    try {
        // Send the file to the server using POST
        const res = await fetch("/upload-scenarios", {
            method: "POST",
            body: formData,
        });

        // Parse the server response
        const result = await res.json();

        // Show success message
        uploadStatus.textContent = `"${file.name}" uploaded successfully.`;
    } catch (err) {
        // Log error and show failure message
        console.error(err);
        uploadStatus.textContent = `Upload failed for ${file.name}`;
    }
}
