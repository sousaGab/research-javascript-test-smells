import pandas as pd
import os
import re

def load_data(refactor_dataset_path, original_smells_path, refactored_smells_path):
    """Load the CSV files."""
    original_smells = pd.read_csv(original_smells_path)
    refactored_smells = pd.read_csv(refactored_smells_path)
    refactor_dataset = pd.read_csv(refactor_dataset_path)
    return original_smells, refactored_smells, refactor_dataset

def filter_smells(smells, file_path, smell_type):
    """Filter smells based on file path and smell type."""
    return smells[
        smells["file"].str.contains(file_path, na=False) & (smells["type"] == smell_type)
    ]

def is_smell_removed(original_count, refactored_count):
    """Check if a smell was removed."""
    return refactored_count < original_count

def is_smell_added(original_count, refactored_count):
    """Check if a smell was added."""
    return refactored_count > original_count

def read_test_summary(file_path):
    """Read the test summary CSV file."""
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
            # Extract the test summary section
            # get the line 2 until 5
            test_summary = ''.join(lines[1:5]).strip() 
            return test_summary
    except FileNotFoundError:
        print(f"Test summary file not found: {file_path}")
        return None
        

def parse_test_summary(test_summary):
    """Parse the test summary to extract passed and failed test counts."""
    if not test_summary:
        return {"passed": 0, "failed": 0}

    passed = 0
    failed = 0

    # Find all "X passed" and "Y failed" for both Test Suites and Tests
    for match in re.finditer(r"(Test Suites|Tests):([^\n]+)", test_summary):
        line = match.group(2)
        passed_match = re.search(r"(\d+)\s*passed", line)
        failed_match = re.search(r"(\d+)\s*failed", line)
        if passed_match:
            passed += int(passed_match.group(1))
        if failed_match:
            failed += int(failed_match.group(1))

    return {"passed": passed, "failed": failed}

def test_results_changed(original_summary, refactored_summary):
    """Check if the test results have changed."""
    original_results = parse_test_summary(original_summary)
    refactored_results = parse_test_summary(refactored_summary)

    # Compare the number of passed tests
    return original_results["passed"] != refactored_results["passed"]

def parse_coverage_summary(coverage_summary):
    """Parse the coverage summary to extract coverage metrics."""
    if not coverage_summary:
        return {"Statements": 0.0, "Branches": 0.0, "Functions": 0.0, "Lines": 0.0}

    # Use regex to extract coverage metrics
    coverage_metrics = {
        "Statements": float(re.search(r"Statements\s*:\s*([\d.]+)%", coverage_summary).group(1)),
        "Branches": float(re.search(r"Branches\s*:\s*([\d.]+)%", coverage_summary).group(1)),
        "Functions": float(re.search(r"Functions\s*:\s*([\d.]+)%", coverage_summary).group(1)),
        "Lines": float(re.search(r"Lines\s*:\s*([\d.]+)%", coverage_summary).group(1)),
    }
    return coverage_metrics

def coverage_results_changed(original_summary, refactored_summary):
    """Check if the coverage results have changed."""
    original_coverage = parse_coverage_summary(original_summary)
    refactored_coverage = parse_coverage_summary(refactored_summary)

    # Compare each coverage metric
    return original_coverage != refactored_coverage


def read_coverage_summary(file_path):
    """Read the coverage summary CSV file."""
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
            # Extract the coverage summary section
            # get the line 8 until 12
            coverage_summary = ''.join(lines[8:12])
            return coverage_summary
    except FileNotFoundError:
        print(f"Test summary file not found: {file_path}")
        return None

def get_added_smells(original_smells, refactored_smells, file_path):
    """
    Identify which smell types were added in the refactored version for the given file.
    Returns a list of smell types that are present in refactored_smells but not in original_smells.
    """
    # Filter by file path
    original_file_smells = original_smells[original_smells["file"].str.contains(file_path, na=False)]
    refactored_file_smells = refactored_smells[refactored_smells["file"].str.contains(file_path, na=False)]

    # Get sets of smell types
    original_types = set(original_file_smells["type"])
    refactored_types = set(refactored_file_smells["type"])

    # Smells added are those in refactored but not in original
    added_types = list(refactored_types - original_types)

    # If no new types, check for increased count of existing types
    for smell_type in original_types & refactored_types:
        orig_count = len(original_file_smells[original_file_smells["type"] == smell_type])
        refac_count = len(refactored_file_smells[refactored_file_smells["type"] == smell_type])
        if refac_count > orig_count:
            added_types.append(smell_type)

    return added_types


def main():


    tools = ["copilot", "whisper"]
    tools_name = 'copilot'
    
    for tool in tools:

        if tool == "copilot":
            tools_name = "Copilot"
        elif tool == "whisper":
            tools_name = "Whisperer"

        # File paths
        refactor_dataset_path = f"/home/username/Desktop/refactoring-smells/scripts/assets/Refactor - Dataset_{tools_name}.csv"
        refactor_dataset_output_path = f"/home/username/Desktop/refactoring-smells/scripts/assets/Refactor - Dataset_{tools_name}_updated.csv"

        # Load the dataset
        refactor_dataset = pd.read_csv(refactor_dataset_path)

        # Iterate over each row in the dataset
        for index, row in refactor_dataset.iterrows():
            # Extract relevant fields
            file_path = row["File"][1:]  # Remove the first character from file_path
            smell_type = row["Type"]
            smell_id = row["Id"]

            # File paths for smells
            original_smells_path = f"/home/username/Desktop/refactoring-smells/refactoring_data/{tool}/smell_{smell_id}/original_smells.csv"
            refactored_smells_path = f"/home/username/Desktop/refactoring-smells/refactoring_data/{tool}/smell_{smell_id}/refactored_smells.csv"

            # File paths for test summaries
            original_test_summary_path = f"/home/username/Desktop/refactoring-smells/refactoring_data/{tool}/smell_{smell_id}/original_tests_summary.txt"
            refactored_test_summary_path = f"/home/username/Desktop/refactoring-smells/refactoring_data/{tool}/smell_{smell_id}/refactored_test_summary.txt"

            try:
                # Load smells data
                original_smells = pd.read_csv(original_smells_path)
                refactored_smells = pd.read_csv(refactored_smells_path)

                # Filter smells for the specific file and type
                original_filtered = filter_smells(original_smells, file_path, smell_type)
                refactored_filtered = filter_smells(refactored_smells, file_path, smell_type)

                # Count occurrences of the smell in both datasets
                original_count = len(original_filtered)
                refactored_count = len(refactored_filtered)

                # Check if a smell was removed or added
                refactor_dataset.at[index, "Removed smell"] = is_smell_removed(original_count, refactored_count)
                refactor_dataset.at[index, "Added new smell"] = is_smell_added(original_count, refactored_count)

                # Identify which smell(s) were added, if any
                added_smells = []
                if is_smell_added(original_count, refactored_count):
                    added_smells = get_added_smells(original_smells, refactored_smells, file_path)
                refactor_dataset.at[index, "Smell added"] = str(added_smells) if added_smells else ""

                # Read test summaries
                original_test_summary = read_test_summary(original_test_summary_path)
                refactored_test_summary = read_test_summary(refactored_test_summary_path)

                # Read coverage summaries
                original_coverage_summary = read_coverage_summary(original_test_summary_path)
                refactored_coverage_summary = read_coverage_summary(refactored_test_summary_path)

                # Check if test results have changed
                results_changed = test_results_changed(original_test_summary, refactored_test_summary)

                # Check if coverage results have changed
                coverage_changed = coverage_results_changed(original_coverage_summary, refactored_coverage_summary)


                # Update the dataset
                refactor_dataset.at[index, "Test before"] = original_test_summary if original_test_summary else ""
                refactor_dataset.at[index, "Test after"] = refactored_test_summary if refactored_test_summary else ""
                refactor_dataset.at[index, "Coverage before"] = original_coverage_summary if original_coverage_summary else ""
                refactor_dataset.at[index, "Coverage after"] = refactored_coverage_summary if refactored_coverage_summary else ""
                refactor_dataset.at[index, "Test results changed"] = results_changed
                refactor_dataset.at[index, "Coverage changed"] = coverage_changed


            except FileNotFoundError:
                # If the smell files are missing, mark as False
                print(f"Smell files not found for Id={smell_id}. Skipping...")
                refactor_dataset.at[index, "Removed smell"] = False
                refactor_dataset.at[index, "Added new smell"] = False
                refactor_dataset.at[index, "Smell added"] = ""

        # Save the updated dataset to a new file
        refactor_dataset.to_csv(refactor_dataset_output_path, index=False)
        print(f"Updated dataset saved to {refactor_dataset_output_path}")

if __name__ == "__main__":
    main()