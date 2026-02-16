"""
Schema synchronization utilities.

Auto-generates ORM model code based on actual database schema.
"""

from typing import Dict, List
from sqlalchemy import text
from sqlalchemy.orm import Session


def get_table_schema(session: Session, table_name: str) -> Dict:
    """Get complete schema information for a table."""
    # Get columns
    columns_result = session.execute(text(f"PRAGMA table_info({table_name})"))
    columns = []
    for row in columns_result:
        columns.append({
            'cid': row[0],
            'name': row[1],
            'type': row[2],
            'notnull': row[3],
            'default': row[4],
            'pk': row[5]
        })

    # Get foreign keys
    fk_result = session.execute(text(f"PRAGMA foreign_key_list({table_name})"))
    foreign_keys = []
    for row in fk_result:
        foreign_keys.append({
            'id': row[0],
            'seq': row[1],
            'table': row[2],
            'from': row[3],
            'to': row[4],
            'on_update': row[5],
            'on_delete': row[6]
        })

    return {
        'name': table_name,
        'columns': columns,
        'foreign_keys': foreign_keys
    }


def sqlite_to_sqlalchemy_type(sqlite_type: str) -> str:
    """Convert SQLite type to SQLAlchemy type."""
    type_map = {
        'INTEGER': 'Integer',
        'VARCHAR': 'String',
        'TEXT': 'Text',
        'FLOAT': 'Float',
        'BOOLEAN': 'Boolean',
        'DATETIME': 'DateTime',
        'TIMESTAMP': 'DateTime',
    }

    sqlite_type_upper = sqlite_type.upper()
    for sqlite, sqlalchemy in type_map.items():
        if sqlite in sqlite_type_upper:
            return sqlalchemy

    return 'String'  # Default fallback


def generate_model_code(schema: Dict) -> str:
    """Generate SQLAlchemy model code from schema."""
    table_name = schema['name']
    class_name = ''.join(word.capitalize() for word in table_name.split('_'))

    code = f"\nclass {class_name}(Base):\n"
    code += f'    """{class_name} model."""\n'
    code += f"    __tablename__ = '{table_name}'\n\n"

    # Generate columns
    for col in schema['columns']:
        col_name = col['name']
        col_type = sqlite_to_sqlalchemy_type(col['type'])

        params = []
        if col['pk']:
            params.append('primary_key=True')
            if col['type'] == 'INTEGER':
                params.append('autoincrement=True')

        if col['notnull'] and not col['pk']:
            params.append('nullable=False')

        if col['default']:
            params.append(f"default={col['default']}")

        params_str = ', '.join(params) if params else ''
        code += f"    {col_name} = Column({col_type}"
        if params_str:
            code += f", {params_str}"
        code += ")\n"

    return code


def cmd_sync_schema(session: Session) -> str:
    """Generate ORM model code from current database schema."""
    # Get all tables
    result = session.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))
    tables = [row[0] for row in result]

    output = "Generated ORM Models\n"
    output += "=" * 60 + "\n\n"
    output += "Copy this code to models.py:\n\n"
    output += "=" * 60 + "\n"

    for table in tables:
        schema = get_table_schema(session, table)
        model_code = generate_model_code(schema)
        output += model_code + "\n"

    output += "=" * 60 + "\n"
    output += "\nNote: Review and adjust the generated code as needed.\n"
    output += "This is a starting point - you may need to:\n"
    output += "  - Add relationships\n"
    output += "  - Add indexes\n"
    output += "  - Adjust column types\n"
    output += "  - Add docstrings\n"

    return output
