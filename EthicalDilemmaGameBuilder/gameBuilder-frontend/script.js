document.getElementById("zipButton").addEventListener("click", async () => {
    const status = document.getElementById("status");
    const zipName = document.getElementById("zipNameInput").value || "game_files.zip"; // Default name if empty

    status.textContent = "Zipping files...";

    try {
        const response = await fetch(`/zip?filename=${encodeURIComponent(zipName)}`, { method: "POST" });
        const data = await response.json();

        if (response.ok) {
            status.textContent = "Game files zipped successfully!";
        } else {
            status.textContent = `Error: ${data.error || 'Unknown error'}`;
        }
    } catch (error) {
        status.textContent = "Error zipping files.";
    }
});

document.getElementById("buildButton").addEventListener("click", async () => {
    const status = document.getElementById("status");
    status.textContent = "Building executable...";

    try {
        const response = await fetch("/build", { method: "POST" });
        const data = await response.json();
        status.textContent = data.message;
    } catch (error) {
        status.textContent = "Error building executable.";
    }
});
