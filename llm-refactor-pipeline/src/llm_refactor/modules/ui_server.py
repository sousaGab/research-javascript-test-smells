"""
UI Server module for LLM Refactor Pipeline.

This module starts the Smell Selector UI (backend + frontend) directly from
the llm-refactor CLI, providing a seamless integrated experience.
"""

import os
import sys
import time
import signal
import subprocess
from pathlib import Path
from typing import Optional

from llm_refactor.modules.base import SimpleModule


class UIServerModule(SimpleModule):
    """
    Start the Smell Selector web UI.

    This module launches both the FastAPI backend and Vite frontend servers,
    allowing researchers to visually select and manage test smells.

    Usage:
        llm-refactor> ui
        llm-refactor> ui start
        llm-refactor> ui stop
    """

    name = "ui"
    description = "Start the Smell Selector web UI"

    def __init__(self):
        super().__init__()
        self.backend_process: Optional[subprocess.Popen] = None
        self.frontend_process: Optional[subprocess.Popen] = None
        self.ui_dir = self._find_ui_directory()

    def _find_ui_directory(self) -> Optional[Path]:
        """Find the smell-selector-ui directory."""
        # Start from this file and go up to project root
        current = Path(__file__).parent

        # Go up to llm-refactor-pipeline/src/llm_refactor/modules
        # Then up to project root (research-javascript-test-smells)
        project_root = current.parent.parent.parent.parent
        ui_dir = project_root / "smell-selector-ui"

        if ui_dir.exists():
            return ui_dir
        return None

    def _check_prerequisites(self) -> tuple[bool, str]:
        """Check if prerequisites are met."""
        if not self.ui_dir:
            return False, "smell-selector-ui directory not found"

        # Check if backend exists
        backend_dir = self.ui_dir / "backend"
        if not backend_dir.exists():
            return False, f"Backend directory not found at {backend_dir}"

        # Check if frontend exists
        frontend_dir = self.ui_dir / "frontend"
        if not frontend_dir.exists():
            return False, f"Frontend directory not found at {frontend_dir}"

        # Check Python
        try:
            subprocess.run(
                ["python3", "--version"],
                capture_output=True,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False, "Python 3 not found. Please install Python 3.8+"

        # Check Node.js
        try:
            subprocess.run(
                ["node", "--version"],
                capture_output=True,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False, "Node.js not found. Please install Node.js 18+"

        return True, "All prerequisites met"

    def _check_database(self) -> tuple[bool, str]:
        """Check if database exists and has smells."""
        db_path = self.ui_dir.parent / "research_data" / "research.db"

        if not db_path.exists():
            return False, (
                f"Database not found at {db_path}\n\n"
                "Please run smell detection first:\n"
                "  llm-refactor> /analyze-smells <repo-name>"
            )

        return True, f"Database found at {db_path}"

    def _apply_migration(self) -> tuple[bool, str]:
        """Apply database migration if needed."""
        print("  Checking database schema...")

        backend_dir = self.ui_dir / "backend"
        migration_script = backend_dir / "migrate_database.py"

        if not migration_script.exists():
            return False, f"Migration script not found at {migration_script}"

        try:
            result = subprocess.run(
                ["python3", str(migration_script)],
                cwd=str(backend_dir),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                return False, f"Migration failed:\n{result.stderr}"

            return True, "Database schema up-to-date"

        except subprocess.TimeoutExpired:
            return False, "Migration timed out after 30 seconds"
        except Exception as e:
            return False, f"Migration error: {str(e)}"

    def _install_dependencies(self) -> tuple[bool, str]:
        """Install backend and frontend dependencies if needed."""
        backend_dir = self.ui_dir / "backend"
        frontend_dir = self.ui_dir / "frontend"

        # Check backend dependencies
        backend_flag = backend_dir / ".dependencies_installed"
        if not backend_flag.exists():
            print("  Installing backend dependencies...")
            try:
                subprocess.run(
                    ["pip3", "install", "-q", "-r", "requirements.txt"],
                    cwd=str(backend_dir),
                    check=True,
                    timeout=120
                )
                backend_flag.touch()
            except Exception as e:
                return False, f"Failed to install backend dependencies: {e}"

        # Check frontend dependencies
        node_modules = frontend_dir / "node_modules"
        if not node_modules.exists():
            print("  Installing frontend dependencies...")
            try:
                subprocess.run(
                    ["npm", "install", "--silent"],
                    cwd=str(frontend_dir),
                    check=True,
                    timeout=180
                )
            except Exception as e:
                return False, f"Failed to install frontend dependencies: {e}"

        return True, "Dependencies installed"

    def _start_backend(self) -> tuple[bool, str]:
        """Start the FastAPI backend server."""
        backend_dir = self.ui_dir / "backend"
        backend_script = backend_dir / "main.py"

        if not backend_script.exists():
            return False, f"Backend main.py not found at {backend_script}"

        print("  Starting backend (FastAPI)...")

        try:
            # Start backend process
            self.backend_process = subprocess.Popen(
                ["python3", str(backend_script)],
                cwd=str(backend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Wait for backend to be ready
            for i in range(15):
                try:
                    import urllib.request
                    urllib.request.urlopen("http://localhost:8001/", timeout=1)
                    print("  ✓ Backend ready at http://localhost:8001")
                    return True, "Backend started successfully"
                except:
                    time.sleep(1)

            return False, "Backend failed to start (timeout after 15s)"

        except Exception as e:
            return False, f"Failed to start backend: {e}"

    def _start_frontend(self) -> tuple[bool, str]:
        """Start the Vite frontend server."""
        frontend_dir = self.ui_dir / "frontend"

        print("  Starting frontend (Vite)...")

        try:
            # Start frontend process
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=str(frontend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Wait for frontend to be ready
            for i in range(15):
                try:
                    import urllib.request
                    urllib.request.urlopen("http://localhost:5173/", timeout=1)
                    print("  ✓ Frontend ready at http://localhost:5173")
                    return True, "Frontend started successfully"
                except:
                    time.sleep(1)

            return False, "Frontend failed to start (timeout after 15s)"

        except Exception as e:
            return False, f"Failed to start frontend: {e}"

    def _open_browser(self):
        """Open browser to the UI (macOS/Linux)."""
        try:
            import webbrowser
            time.sleep(1)  # Give servers a moment
            webbrowser.open("http://localhost:5173")
        except Exception as e:
            print(f"  Note: Could not auto-open browser: {e}")

    def _stop_servers(self):
        """Stop backend and frontend servers."""
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
                print("  ✓ Backend stopped")
            except:
                self.backend_process.kill()

        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=5)
                print("  ✓ Frontend stopped")
            except:
                self.frontend_process.kill()

    def execute(self, args: str = "") -> str:
        """
        Execute the UI server module.

        Args:
            args: Command arguments:
                - "" or "start": Start the UI servers
                - "stop": Stop running servers (not implemented in CLI context)

        Returns:
            Status message
        """
        args = args.strip().lower()

        # Handle stop command
        if args == "stop":
            return (
                "Note: Servers run in background.\n"
                "To stop, press Ctrl+C in the llm-refactor shell or close the terminal."
            )

        # Start command (default)
        print("\n" + "="*60)
        print("🚀 Starting Smell Selector UI")
        print("="*60 + "\n")

        # 1. Check prerequisites
        print("📋 Checking prerequisites...")
        success, message = self._check_prerequisites()
        if not success:
            return f"✗ Prerequisites check failed:\n  {message}"
        print(f"  ✓ {message}")

        # 2. Check database
        print("\n🗄️  Checking database...")
        success, message = self._check_database()
        if not success:
            return f"✗ Database check failed:\n  {message}"
        print(f"  ✓ {message}")

        # 3. Apply migration
        print("\n🔄 Applying database migration...")
        success, message = self._apply_migration()
        if not success:
            return f"✗ Migration failed:\n  {message}"
        print(f"  ✓ {message}")

        # 4. Install dependencies
        print("\n📦 Installing dependencies...")
        success, message = self._install_dependencies()
        if not success:
            return f"✗ Dependency installation failed:\n  {message}"
        print(f"  ✓ {message}")

        # 5. Start backend
        print("\n🔧 Starting servers...")
        success, message = self._start_backend()
        if not success:
            self._stop_servers()
            return f"✗ Backend failed to start:\n  {message}"

        # 6. Start frontend
        success, message = self._start_frontend()
        if not success:
            self._stop_servers()
            return f"✗ Frontend failed to start:\n  {message}"

        # 7. Open browser
        print("\n🌐 Opening browser...")
        self._open_browser()

        # Success message
        result = (
            "\n" + "="*60 + "\n"
            "✨ Smell Selector UI is running!\n"
            "="*60 + "\n\n"
            "  🌐 Frontend:  http://localhost:5173\n"
            "  🔌 API:       http://localhost:8001\n"
            "  📚 API Docs:  http://localhost:8001/docs\n\n"
            "="*60 + "\n\n"
            "The servers are running in the background.\n"
            "You can continue using the llm-refactor CLI.\n\n"
            "To stop the servers:\n"
            "  - Press Ctrl+C to exit llm-refactor (will stop servers)\n"
            "  - Or close this terminal window\n\n"
            "Note: The UI will remain open in your browser even if you\n"
            "continue using other llm-refactor commands."
        )

        # Register cleanup on exit
        def cleanup_handler(signum, frame):
            print("\n\n🛑 Shutting down UI servers...")
            self._stop_servers()
            sys.exit(0)

        signal.signal(signal.SIGINT, cleanup_handler)
        signal.signal(signal.SIGTERM, cleanup_handler)

        return result


# Create module instance
ui_server_module = UIServerModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """
    Execute UI server module.

    This function is called by the CLI router.

    Args:
        args: Optional arguments from CLI
            - "" or "start": Start the UI servers
            - "stop": Stop message

    Returns:
        Execution result

    Examples:
        >>> execute()
        # Starts backend + frontend, opens browser

        >>> execute("start")
        # Same as above

        >>> execute("stop")
        # Shows stop instructions
    """
    return ui_server_module.run(args)


# Allow direct execution for testing
if __name__ == "__main__":
    result = execute()
    print(result)
