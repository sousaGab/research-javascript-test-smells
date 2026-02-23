# LaTeX Documentation for Master's Dissertation

## Overview

This directory contains comprehensive LaTeX documentation for the LLM-based test smell refactoring methodology, suitable for inclusion in a master's degree dissertation.

## Files Created

### 1. **LLM_METHODOLOGY_DISSERTATION.tex** (Main Document)
**Purpose:** Complete academic explanation of the LLM-based refactoring methodology.

**Contents:**
- Overview and motivation
- LLM selection rationale (6 models across 4 providers)
- Three prompting strategies (Zero-Shot, Few-Shot, Chain-of-Thought)
- Automated two-phase pipeline (Refactoring + Validation)
- Database schema and traceability
- Statistical experimental design
- Reproducibility mechanisms
- Limitations and threats to validity

**Usage:** This is the primary document for your dissertation's methodology section.

**Compilation:**
```bash
pdflatex LLM_METHODOLOGY_DISSERTATION.tex
```

**Key Sections:**
- Section 1: Main methodology explanation
- Algorithms 1-2: Pseudocode for automated pipeline
- Tables 1-3: Model specifications, strategy comparison, schema

---

### 2. **LLM_METHODOLOGY_SUPPLEMENT.tex** (Implementation Details)
**Purpose:** Technical implementation details and code architecture.

**Contents:**
- System architecture overview (5 subsystems)
- Multi-provider LLM client (Strategy + Factory patterns)
- Prompt construction pipeline
- Code extraction and validation
- Backup and restoration system
- Smell analysis framework
- Test execution and coverage parsing
- Database schema details
- Batch experiment orchestration
- Performance optimizations
- Error handling and recovery
- Re-execution support (--redo flag)
- Research implications and future directions

**Usage:** Include in appendices or implementation chapter.

**Compilation:**
```bash
pdflatex LLM_METHODOLOGY_SUPPLEMENT.tex
```

---

### 3. **LLM_VISUAL_DIAGRAMS.tex** (Visual Representations)
**Purpose:** TikZ diagrams and visual workflow representations.

**Required Packages:**
```latex
\usepackage{tikz}
\usepackage{pgfplots}
```

**Contents:**
- Figure 1: High-level system architecture
- Figure 2: Two-phase experiment workflow
- Figure 3: Prompt strategy comparison (component breakdown)
- Figure 4: LLM provider distribution chart
- Figure 5: Experiment state machine
- Figure 6: Database entity-relationship diagram
- Figure 7: Validation metrics hierarchy
- Figure 8: Batch processing flow
- Figure 9: Typical experiment execution timeline
- Figure 10: Research questions mapping

**Usage:** Include figures throughout methodology and results chapters.

**Compilation:**
```bash
pdflatex LLM_VISUAL_DIAGRAMS.tex
```

**Note:** Requires TikZ. If compilation fails, ensure `\usetikzlibrary{shapes, arrows, positioning}` is in preamble.

---

### 4. **LLM_QUICK_REFERENCE_TABLES.tex** (Reference Tables)
**Purpose:** Comprehensive tabular summaries for quick reference.

**Contents:**
- Table 1: Test smell catalog summary
- Table 2: Complete LLM model specifications
- Table 3: Detailed strategy comparison matrix
- Table 4: Research variables and levels
- Table 5: Validation metric definitions
- Table 6: Database schema reference
- Table 7: Software environment specifications
- Table 8: Example experiment database entry
- Table 9: Statistical tests applied
- Table 10: Validity threats and mitigation
- Table 11: Estimated costs per experiment

**Usage:** Appendix or distributed throughout dissertation for quick lookups.

**Compilation:**
```bash
pdflatex LLM_QUICK_REFERENCE_TABLES.tex
```

---

## Integration into Dissertation

### Recommended Structure

```
Chapter 3: Methodology
├── 3.1 Research Design
├── 3.2 LLM-Based Refactoring Methodology  ← LLM_METHODOLOGY_DISSERTATION.tex
│   ├── 3.2.1 LLM Selection
│   ├── 3.2.2 Prompt Engineering Strategies
│   ├── 3.2.3 Automated Pipeline
│   └── 3.2.4 Validation Framework
├── 3.3 Data Collection
└── 3.4 Analysis Methods

Chapter 4: Implementation
├── 4.1 System Architecture  ← LLM_METHODOLOGY_SUPPLEMENT.tex (Sections 1-3)
├── 4.2 Core Components
└── 4.3 Performance Optimizations

Chapter 5: Results
├── 5.1 Descriptive Statistics  ← LLM_QUICK_REFERENCE_TABLES.tex (Tables)
├── 5.2 Comparative Analysis
└── 5.3 Discussion

Appendices
├── Appendix A: Complete Database Schema  ← LLM_QUICK_REFERENCE_TABLES.tex
├── Appendix B: Prompt Templates
└── Appendix C: Visual Workflow Diagrams  ← LLM_VISUAL_DIAGRAMS.tex
```

### Copy-Paste Sections

The documents are modular. You can extract specific sections:

**Example: Extracting Zero-Shot explanation**
```latex
% From LLM_METHODOLOGY_DISSERTATION.tex, lines ~90-110
\subsubsection{Zero-Shot Prompting}
Zero-shot prompting provides the LLM with a direct instruction...
```

**Example: Extracting System Architecture diagram**
```latex
% From LLM_VISUAL_DIAGRAMS.tex
\begin{figure}[h]
\centering
\begin{tikzpicture}[...]
% Full TikZ code
\end{tikzpicture}
\caption{High-Level System Architecture}
\label{fig:architecture}
\end{figure}
```

---

## Compilation Instructions

### Full Document Compilation

```bash
# Compile main methodology (includes references to figures/tables)
pdflatex LLM_METHODOLOGY_DISSERTATION.tex
bibtex LLM_METHODOLOGY_DISSERTATION    # If bibliography added
pdflatex LLM_METHODOLOGY_DISSERTATION.tex
pdflatex LLM_METHODOLOGY_DISSERTATION.tex

# Compile supplements
pdflatex LLM_METHODOLOGY_SUPPLEMENT.tex
pdflatex LLM_VISUAL_DIAGRAMS.tex
pdflatex LLM_QUICK_REFERENCE_TABLES.tex
```

### Integration into Existing Dissertation

1. **Copy sections** into your main dissertation `.tex` file
2. **Ensure packages** are loaded in preamble:
   ```latex
   \usepackage{amsmath}
   \usepackage{algorithm}
   \usepackage{algpseudocode}
   \usepackage{booktabs}
   \usepackage{tikz}
   \usepackage{pgfplots}
   \usetikzlibrary{shapes, arrows, positioning}
   ```
3. **Adjust labels** to match your dissertation's section numbering
4. **Add citations** where placeholders like `~\cite{mockus2022test}` appear

---

## Key Mathematical Formulations

### Prompt Strategy Formulations

**Zero-Shot:**
```latex
P_{\text{zero}}(C_r | C_s, D_s) = \text{LLM}(\text{Task} \oplus D_s \oplus C_s)
```

**Few-Shot:**
```latex
P_{\text{few}}(C_r | C_s, D_s, E) = \text{LLM}(\text{Task} \oplus D_s \oplus E_{1:k} \oplus C_s)
```

**Chain-of-Thought:**
```latex
P_{\text{cot}}(C_r | C_s, D_s, R_s, S_d, E) = \text{LLM}(\text{Task} \oplus D_s \oplus S_d \oplus R_s \oplus E_{1:2} \oplus C_s \oplus \text{CoT}_{\text{template}})
```

### Success Rate Metrics

```latex
\text{Success Rate} = \frac{\text{smell\_removed} \land \text{tests\_pass} \land \neg\text{new\_smells}}{\text{total\_experiments}}
```

---

## Figures and Tables Checklist

### From LLM_METHODOLOGY_DISSERTATION.tex:
- [x] Table 1: LLM Models (6 models)
- [x] Table 2: Prompt Strategy Comparison
- [x] Table 3: Experiment Database Schema
- [x] Algorithm 1: Batch Refactoring Phase
- [x] Algorithm 2: Batch Execution Phase

### From LLM_VISUAL_DIAGRAMS.tex:
- [x] Figure 1: System Architecture (TikZ)
- [x] Figure 2: Two-Phase Workflow (TikZ)
- [x] Figure 3: Prompt Strategy Components (TikZ)
- [x] Figure 4: LLM Provider Distribution (pgfplots)
- [x] Figure 5: Experiment State Machine (TikZ)
- [x] Figure 6: ER Diagram (TikZ)
- [x] Figure 7: Metrics Hierarchy (TikZ tree)
- [x] Figure 8: Batch Processing Flow (TikZ flowchart)
- [x] Figure 9: Experiment Timeline (TikZ timeline)
- [x] Figure 10: Research Questions Mapping

### From LLM_QUICK_REFERENCE_TABLES.tex:
- [x] Table 1: Test Smell Catalog (10 smells)
- [x] Table 2: LLM Specifications (detailed)
- [x] Table 3: Strategy Comparison Matrix
- [x] Table 4: Research Variables
- [x] Table 5: Validation Metrics
- [x] Table 6: Database Tables
- [x] Table 7: Software Environment
- [x] Table 8: Example Experiment Record
- [x] Table 9: Statistical Tests
- [x] Table 10: Validity Threats
- [x] Table 11: Cost Estimates

---

## Bibliography Entries to Add

The documents reference several citations. Add these to your `.bib` file:

```bibtex
@article{mockus2022test,
  title={Test smells: A survey of knowledge in the community},
  author={Mockus, Audris and others},
  journal={Journal of Systems and Software},
  year={2022}
}

@inproceedings{brown2020language,
  title={Language models are few-shot learners},
  author={Brown, Tom and others},
  booktitle={NeurIPS},
  year={2020}
}

@inproceedings{chen2021evaluating,
  title={Evaluating large language models trained on code},
  author={Chen, Mark and others},
  booktitle={arXiv preprint arXiv:2107.03374},
  year={2021}
}

@inproceedings{wei2022chain,
  title={Chain-of-thought prompting elicits reasoning in large language models},
  author={Wei, Jason and others},
  booktitle={NeurIPS},
  year={2022}
}

@article{zheng2024qwen2,
  title={Qwen2.5-Coder Technical Report},
  author={Zheng, Binyuan and others},
  journal={arXiv preprint arXiv:2409.12186},
  year={2024}
}
```

---

## Customization Tips

### Changing Colors in Diagrams
```latex
% In LLM_VISUAL_DIAGRAMS.tex, modify:
fill=blue!20  % Change blue and intensity (0-100)
```

### Adjusting Table Font Sizes
```latex
% Add before table:
\small      % Smaller
\footnotesize  % Even smaller
\scriptsize    % Very small
```

### Adding Your University Template
Replace document class:
```latex
% Instead of:
\documentclass[12pt]{article}

% Use:
\documentclass[12pt]{your-university-thesis-class}
```

---

## Troubleshooting

### TikZ Compilation Errors
```bash
# Install missing TikZ libraries:
sudo apt-get install texlive-pictures  # Ubuntu
brew install texlive-pictures           # macOS
```

### Table Too Wide
```latex
% Use smaller fonts or landscape:
\begin{landscape}
\begin{table}[h]
...
\end{table}
\end{landscape}
```

### Algorithm Package Conflicts
```latex
% If algorithm2e conflicts with algpseudocode:
\usepackage[ruled,vlined]{algorithm2e}  % Remove and use:
\usepackage{algorithm}
\usepackage{algpseudocode}
```

---

## Final Checklist Before Submission

- [ ] All tables referenced in text
- [ ] All figures referenced in text
- [ ] Citations resolved (no `??` in PDF)
- [ ] Labels are unique (no duplicate `\label{}`s)
- [ ] Page numbers correct
- [ ] Figures/tables on correct pages (use `[h!]` or `[H]` with `\usepackage{float}`)
- [ ] Math symbols render correctly
- [ ] Code listings readable
- [ ] TikZ diagrams render without errors
- [ ] Consistency in terminology (e.g., "smell" vs "test smell")

---

## Contact and Attribution

These LaTeX documents were generated based on the LLM-based test smell refactoring research project. When using in your dissertation, ensure proper attribution to the research source.

**Generated:** February 22, 2026  
**Purpose:** Master's Degree Dissertation - Software Engineering  
**Topic:** LLM-Based Automated Refactoring of JavaScript Test Smells

---

## License

These LaTeX documents are provided for academic use in your master's dissertation. Modify as needed to fit your university's formatting requirements and citation style.

Good luck with your dissertation! 🎓
