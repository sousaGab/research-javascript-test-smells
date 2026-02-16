"""
Database connection and initialization module.

Handles database creation, connection management, and schema initialization.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, scoped_session
from .models import Base, SchemaVersion

# Default database path - go up to project root (research-javascript-test-smells/)
# connection.py -> database/ -> modules/ -> llm_refactor/ -> src/ -> llm-refactor-pipeline/ -> project root
DEFAULT_DB_PATH = Path(__file__).parent.parent.parent.parent.parent.parent / "research_data" / "research.db"


class ResearchDB:
    """
    Research database connection manager.

    Handles database initialization, connections, and provides
    a context manager for safe transaction handling.

    Usage:
        db = ResearchDB()
        db.init_database()

        with db.session_scope() as session:
            repo = Repository(name='dayjs')
            session.add(repo)
    """

    def __init__(self, db_path=None):
        """
        Initialize database connection.

        Args:
            db_path: Path to SQLite database file. If None, uses default location.
        """
        self.db_path = Path(db_path) if db_path else DEFAULT_DB_PATH
        self.db_url = f"sqlite:///{self.db_path}"
        self.engine = None
        self.SessionFactory = None
        self._initialized = False

    def init_database(self, force_recreate=False):
        """
        Initialize the database and create all tables.

        Args:
            force_recreate: If True, drops all tables and recreates them.
                           WARNING: This will delete all data!

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Ensure research_data directory exists
            self.db_path.parent.mkdir(parents=True, exist_ok=True)

            # Create engine with SQLite optimizations
            self.engine = create_engine(
                self.db_url,
                echo=False,  # Set to True for SQL query debugging
                connect_args={
                    'check_same_thread': False,  # Allow multithreading
                }
            )

            # Enable foreign key constraints for SQLite
            @event.listens_for(self.engine, "connect")
            def set_sqlite_pragma(dbapi_conn, connection_record):
                cursor = dbapi_conn.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()

            # Create session factory
            self.SessionFactory = scoped_session(sessionmaker(bind=self.engine))

            # Create or recreate tables
            if force_recreate:
                print("⚠️  Dropping all tables...")
                Base.metadata.drop_all(self.engine)

            Base.metadata.create_all(self.engine)

            # Initialize schema version if this is a new database
            self._init_schema_version()

            self._initialized = True
            print(f"✓ Database initialized at: {self.db_path}")

            # Show status
            if self.db_path.exists():
                size_mb = self.db_path.stat().st_size / (1024 * 1024)
                print(f"  Database size: {size_mb:.2f} MB")

            return True

        except Exception as e:
            print(f"✗ Failed to initialize database: {e}")
            return False

    def _init_schema_version(self):
        """Initialize schema version table if it doesn't exist."""
        session = self.SessionFactory()
        try:
            # Check if schema version exists
            version = session.query(SchemaVersion).filter_by(version='1.0.0').first()
            if not version:
                version = SchemaVersion(
                    version='1.0.0',
                    description='Initial schema: 9 tables for test smell research'
                )
                session.add(version)
                session.commit()
        except Exception as e:
            session.rollback()
            print(f"Warning: Could not initialize schema version: {e}")
        finally:
            session.close()

    def connect(self):
        """
        Establish database connection.

        Returns:
            bool: True if connection successful
        """
        if not self._initialized:
            return self.init_database()
        return True

    def session_scope(self):
        """
        Provide a transactional scope for database operations.

        Usage:
            with db.session_scope() as session:
                repo = Repository(name='dayjs')
                session.add(repo)
                # Automatically commits on success, rolls back on error

        Yields:
            Session: SQLAlchemy session object
        """
        session = self.SessionFactory()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def get_session(self):
        """
        Get a new database session.

        Note: You must manually manage this session (commit, rollback, close).
        For most use cases, prefer using session_scope() context manager.

        Returns:
            Session: SQLAlchemy session object
        """
        if not self._initialized:
            self.init_database()
        return self.SessionFactory()

    def close(self):
        """Close all database connections."""
        if self.SessionFactory:
            self.SessionFactory.remove()
        if self.engine:
            self.engine.dispose()
        self._initialized = False

    def get_status(self):
        """
        Get database status information.

        Returns:
            dict: Database status information
        """
        status = {
            'initialized': self._initialized,
            'path': str(self.db_path),
            'exists': self.db_path.exists(),
            'size_mb': 0.0,
            'writable': False,
        }

        if self.db_path.exists():
            status['size_mb'] = self.db_path.stat().st_size / (1024 * 1024)
            status['writable'] = os.access(self.db_path, os.W_OK)

        return status

    def validate_schema(self):
        """
        Validate that all required tables exist.

        Returns:
            tuple: (is_valid: bool, missing_tables: list)
        """
        expected_tables = {
            'schema_version',
            'repositories',
            'files',
            'detected_smells',
            'study_smells',
            'smell_ui_metadata',
            'experiments',
            'smell_detection_results',
            'code_metrics',
            'test_results',
            'ai_responses',
        }

        try:
            # Get actual tables from database
            from sqlalchemy import inspect
            inspector = inspect(self.engine)
            actual_tables = set(inspector.get_table_names())

            missing = expected_tables - actual_tables
            is_valid = len(missing) == 0

            return (is_valid, list(missing))

        except Exception as e:
            return (False, [f"Error: {str(e)}"])

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

    def __repr__(self):
        return f"<ResearchDB(path='{self.db_path}', initialized={self._initialized})>"


def init_database(db_path=None):
    """
    Convenience function to initialize database.

    Args:
        db_path: Optional custom path to database file

    Returns:
        ResearchDB: Initialized database instance
    """
    db = ResearchDB(db_path)
    db.init_database()
    return db
