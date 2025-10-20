import requests
import csv
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# GitHub API base URL
GITHUB_API_URL = "https://api.github.com"

# Retrieve the GitHub personal access token from the .env file
# GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_TOKEN = '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'

# Headers for authentication
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}"
}

def get_repository_languages(owner, repo_name):
    """
    Fetch the languages used in a repository.
    """
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo_name}/languages"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def get_package_json(owner, repo_name):
    """
    Fetch the package.json file from a repository.
    """
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo_name}/contents/package.json"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        package_json = response.json()
        return requests.get(package_json['download_url']).json()
    return None

def get_license_info(owner, repo_name):
    """
    Fetch the license information for a repository.
    """
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo_name}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    repo_data = response.json()
    license_info = repo_data.get("license", {})
    return license_info.get("name", "No license")

def analyze_repository(owner, repo_name):
    """
    Analyze a repository and extract the required information.
    """
    # Get languages and calculate JavaScript percentage
    languages = get_repository_languages(owner, repo_name)
    total_bytes = sum(languages.values())
    js_percentage = (languages.get("JavaScript", 0) / total_bytes * 100) if total_bytes > 0 else 0

    # Get package.json and test framework
    package_json = get_package_json(owner, repo_name)
    test_framework = "no framework test"
    if package_json and "devDependencies" in package_json:
        dev_dependencies = package_json["devDependencies"]
        for framework in ["jest", "mocha", "jasmine", "ava", "cypress"]:
            if framework in dev_dependencies:
                test_framework = framework
                break

    # Get license information
    license_name = get_license_info(owner, repo_name)

    return {
        "javascript_percentage": js_percentage,
        "test_framework": test_framework,
        "license": license_name
    }

def main():
    input_csv_path = '/Users/gabriel.amaralmercos.com/Desktop/research-javascript-test-smells/repositories/repositories_2025.csv'
    output_csv_path = "output_classification.csv"

    with open(input_csv_path, mode="r", encoding="utf-8") as input_file, \
         open(output_csv_path, mode="w", newline="", encoding="utf-8") as output_file:
        
        reader = csv.DictReader(input_file)
        writer = csv.writer(output_file)
        writer.writerow(["Name", "JavaScript Percentage", "Test Framework", "License"])

        for row in reader:
            repo_full_name = row["name"]
            owner, repo_name = repo_full_name.split("/", 1)
            try:
                repo_data = analyze_repository(owner, repo_name)
                writer.writerow([
                    repo_full_name,
                    f"{repo_data['javascript_percentage']:.2f}%",
                    repo_data["test_framework"],
                    repo_data["license"]
                ])
                print(f"Processed repository: {repo_full_name}")
            except Exception as e:
                print(f"Failed to process repository {repo_full_name}: {e}")

if __name__ == "__main__":
    main()