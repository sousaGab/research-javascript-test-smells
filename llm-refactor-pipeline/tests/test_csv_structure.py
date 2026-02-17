#!/usr/bin/env python3
"""
Quick test to verify CSV structure after concatenation.
"""

import csv
from pathlib import Path

def test_csv_structure():
    # Find a sample smells.csv
    project_root = Path(__file__).parent.parent
    smells_detected = project_root / "smells_detected"

    if not smells_detected.exists():
        print("❌ smells_detected directory not found")
        return

    # Find first smells.csv
    sample_csv = None
    for repo_dir in smells_detected.iterdir():
        if repo_dir.is_dir():
            csv_file = repo_dir / "smells.csv"
            if csv_file.exists():
                sample_csv = csv_file
                break

    if not sample_csv:
        print("❌ No smells.csv found in any repository")
        return

    print(f"📄 Testing CSV: {sample_csv}")
    print("")

    with open(sample_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)

        print(f"✓ Headers ({len(headers)} columns):")
        for i, header in enumerate(headers):
            print(f"  [{i}] {header}")

        print("")

        # Expected structure
        expected = ["file", "type", "line", "method", "methodStart", "methodEnd", "source"]

        if headers == expected:
            print("✅ CSV structure is CORRECT!")
        else:
            print("❌ CSV structure is INCORRECT!")
            print(f"   Expected: {expected}")
            print(f"   Got:      {headers}")
            return

        print("")
        print("Sample rows:")
        print("-" * 80)

        for i, row in enumerate(reader):
            if i >= 3:  # Show only first 3 rows
                break

            print(f"\nRow {i+1}:")
            print(f"  file:        {row[0][:50]}...")
            print(f"  type:        {row[1]}")
            print(f"  line:        {row[2]}")
            print(f"  method:      {'Unknown' if row[3] == 'Unknown' else f'{row[3][:40]}...'}")
            print(f"  methodStart: {row[4] or 'EMPTY'}")
            print(f"  methodEnd:   {row[5] or 'EMPTY'}")
            print(f"  source:      {row[6]}")

            # Check for issues
            if row[3] == 'Unknown':
                print("  ⚠️  WARNING: method is 'Unknown'")
            if not row[4] or not row[5]:
                print("  ⚠️  WARNING: methodStart or methodEnd is empty")

if __name__ == "__main__":
    test_csv_structure()
