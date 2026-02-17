import sys
import os

# Change to llm-refactor-pipeline directory
os.chdir('/home/gabriel/Disk/Research/research-javascript-test-smells/llm-refactor-pipeline')
sys.path.insert(0, 'src')

from llm_refactor.modules.execute_experiment.execute_experiment import ExecuteExperimentModule

# Execute experiment for smell 5
print("Starting experiment for smell 5...")
module = ExecuteExperimentModule()
result = module.execute("5 1 1")
print(result)
print("\nExperiment completed!")
