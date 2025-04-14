# EthicalDilemmaGame Suite

This project is a modular suite of tools designed to support ethical training through interactive, text-based gameplay. The main application is a web-based ethical decision-making game that presents players with dilemmas commonly encountered in humanitarian and professional contexts. It is supported by two additional tools: a Scenario Builder for authoring content and a Game Builder for packaging distributable versions of the game.

Built using **Flask (Python)** for the backend and **Vanilla JavaScript, HTML, and CSS** for the frontend, the system is designed to be lightweight, customizable, and easy to deploy locally.

---

## Features

### Ethical Dilemma Game
- Interactive, narrative-driven ethical scenarios
- Supports multiple scenarios per playthrough
- Tracks player performance (lives, failures, wrong decisions)
- End-game reflection screen with downloadable feedback
- JSON-driven content, allowing for modular scenario files
- Built with Flask and plain JavaScript

### Scenario Builder
- GUI-based web app to build complete JSON scenario files
- Allows educators to define dilemmas, choices, outcomes, and reflection questions
- Fully client-side interface with real-time preview and validation
- Generates downloadable `.json` files compatible with the Ethical Dilemma Game
- Requires no programming knowledge to use

### Game Builder
- Packages the game and selected scenario files into a distributable ZIP
- Optional: Uses PyInstaller to build a standalone executable (OS-specific)
- Enables easy sharing of the full game experience with no setup needed
- Handles folder structure and deployment steps

---

## Development & Methodology
This project followed an Agile Game Development methodology, with iterative testing and revisions based on feedback from a client (a professor of ethics). Each component was built modularly to allow for reuse and future extension. Core principles included:

- Educational impact

- Reflective gameplay

- Ease of deployment and scenario creation

---

## Installation & Usage

### Requirements
- Python 3.x
- Flask
- Dependencies from `requirements.txt`

---

### 💻 Running the Ethical Dilemma Game

Double click the corresponding OS file in each of the apps backends, MacAndLinux(App Name).sh for Mac and Linux and Windows(App Name).bat for Windows.

