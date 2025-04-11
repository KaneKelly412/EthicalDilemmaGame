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
