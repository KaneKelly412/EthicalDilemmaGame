def make_executable(ctx):
    exe = default_python_packaging(ctx)

    # Add frontend files (ethical-dilemma-game-frontend)
    exe.add_resource("../ethical-dilemma-game-frontend", "ethical-dilemma-game-frontend")

    # Add scenario files (Scenarios)
    exe.add_resource("../main-app-backend/Scenarios", "Scenarios")

    # Install Python packages from requirements.txt
    python = exe.python_config
    python.install_pip_requirements("../main-app-backend/requirements.txt")

    # Set the entry point to the main app
    exe.set_main_module("app")  # Main app's entry file

    return exe

register_target("main_app", make_executable)