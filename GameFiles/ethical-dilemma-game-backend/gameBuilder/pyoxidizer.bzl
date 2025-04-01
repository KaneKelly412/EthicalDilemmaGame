def make_executable(ctx):
    exe = default_python_packaging(ctx)

    # Ensure PyOxidizer finds app.py (one folder up)
    python = exe.python_config
    python.module_search_paths.insert(0, "..")  # Add the parent directory to search path

    # Add frontend files (ethical-dilemma-game-frontend)
    exe.add_resource("../../ethical-dilemma-game-frontend", "ethical-dilemma-game-frontend")

    # Add scenario files (Scenarios)
    exe.add_resource("../Scenarios", "Scenarios")

    # Install Python packages from requirements.txt (one folder up)
    python.install_pip_requirements("../requirements.txt")

    exe.set_main_module("app")

    return exe


register_target("app", make_executable)

resolve_targets()
