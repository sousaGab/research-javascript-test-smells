# AI Assistant Instructions for JavaScript Test Smells Research Project

## Project Overview
This repository is a research project focused on analyzing test smells in JavaScript codebases. It contains:
- A curated collection of JavaScript repositories as git submodules in `/repositories/`
- Analysis scripts and tools in the root directory
- Repository metadata and filtering scripts in `/repositories_list/`

## Key Components

### Repository Management
- The `/repositories_list/filtered_repositories.csv` contains metadata about analyzed repositories including:
  - JavaScript percentage
  - Test framework used
  - License information
- New repositories can be added by updating this CSV and using the Python filtering script

### Analysis Scripts
- `filter_script.py` manages repository selection and filtering using GitHub API
  - Requires GitHub token in `.env` file
  - Uses repository language statistics to filter JavaScript-heavy projects

## Development Workflows

### Setting Up
1. Clone the repository with submodules:
   ```bash
   git clone --recursive [repo-url]
   ```
2. Create `.env` file with GitHub token:
   ```
   GITHUB_TOKEN=your_token_here
   ```

### Working with Repository Data
- Always update filtered_repositories.csv when adding new repositories for analysis
- Use the filter script to validate new additions meet criteria:
  - Minimum JavaScript percentage
  - Has test files
  - Compatible license

### Best Practices
- Each analyzed repository should be added as a git submodule in `/repositories/`
- Keep repository metadata up-to-date in CSV files
- Document any new test smell patterns discovered in the analysis

## Key Files
- `/repositories_list/filtered_repositories.csv`: Master list of analyzed repositories
- `/repositories_list/filter_script.py`: Repository filtering and validation
- `/repositories/`: Contains all analyzed codebases as submodules

## Technical Decisions
- Using git submodules for repositories to:
  - Maintain version control
  - Enable easy updates
  - Keep repository sizes manageable
- CSV format for repository metadata enables:
  - Easy manual editing
  - Script processing
  - Version control friendly format

Need any clarification or have suggestions for improving these instructions?