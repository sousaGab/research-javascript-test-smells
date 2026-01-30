# CSV Export Guide

## 📥 How to Export Smells to CSV

The Smell Selector UI provides two ways to export smells to CSV files for further analysis.

---

## Option 1: Export Selected Smells ⭐

**Use case:** Export only the smells you've selected for study.

### From the UI:

1. Select smells by clicking "Select for Study" on individual smells
2. Click the **"⬇️ Export Selected"** button in the filter bar
3. CSV file downloads automatically with filename: `selected_smells_YYYYMMDD_HHMMSS.csv`

### From the API:

```bash
curl -o selected_smells.csv http://localhost:8001/api/export-selected-smells
```

### CSV Columns:

```csv
repository,file_path,smell_type,line_numbers,severity,detection_tool,
detected_at,selected_at,annotations,priority,tags,code_snippet
```

**Example:**
```csv
repository,file_path,smell_type,line_numbers,severity,detection_tool,detected_at,selected_at,annotations,priority,tags,code_snippet
redux-offline,/src/__tests__/send.js,NonFunctionalStatement,"{'startLine':179,'endLine':179}",medium,SNUTSJS,2026-01-30 10:30:00,2026-01-30 11:45:00,"Needs refactoring",4,"complex,priority","beforeEach(() => { trackerMock = { registerAction: () => {}, resolveAction: jest.fn(), rejectAction: jest.fn() } })"
```

---

## Option 2: Export Filtered Smells

**Use case:** Export all detected smells with optional filters.

### From the UI:

1. Apply filters (repository, smell type, tool)
2. Click **"📥 Export Filtered"** button
3. CSV downloads with your current filter settings

### From the API:

```bash
# Export all smells
curl -o all_smells.csv http://localhost:8001/api/export-all-smells

# Export with filters
curl -o filtered_smells.csv "http://localhost:8001/api/export-all-smells?repo=redux-offline&smell_type=Duplicate%20Assert&tool=Steel"
```

### Query Parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `repo` | Repository name | `redux-offline` |
| `smell_type` | Smell type | `Duplicate Assert` |
| `tool` | Detection tool | `SNUTSJS` or `Steel` |

### CSV Columns:

```csv
repository,file_path,smell_type,line_numbers,severity,detection_tool,
detected_at,is_selected,code_snippet
```

**Example:**
```csv
repository,file_path,smell_type,line_numbers,severity,detection_tool,detected_at,is_selected,code_snippet
redux-offline,/src/__tests__/send.js,Duplicate Assert,"{'startLine':45,'endLine':50}",high,Steel,2026-01-30 10:30:00,Yes,"expect(result).toBe(true); expect(result).toBe(true);"
```

---

## 📊 Export Examples

### Example 1: Export All Smells from One Repository

```bash
curl -o redux_smells.csv "http://localhost:8001/api/export-all-smells?repo=redux-offline"
```

### Example 2: Export All "Duplicate Assert" Smells

```bash
curl -o duplicate_asserts.csv "http://localhost:8001/api/export-all-smells?smell_type=Duplicate%20Assert"
```

### Example 3: Export All SNUTSJS Detections

```bash
curl -o snutsjs_smells.csv "http://localhost:8001/api/export-all-smells?tool=SNUTSJS"
```

### Example 4: Combined Filters

```bash
curl -o specific_smells.csv "http://localhost:8001/api/export-all-smells?repo=winston&smell_type=Lazy%20Test&tool=Steel"
```

---

## 🎯 Common Use Cases

### Use Case 1: Export for Research Paper

**Goal:** Get all selected smells with annotations for analysis.

**Steps:**
1. Review and select smells in the UI
2. Add annotations and priorities
3. Click "⬇️ Export Selected"
4. Import CSV into Excel/Python/R for analysis

### Use Case 2: Share with Team

**Goal:** Share filtered smells with team members.

**Steps:**
1. Apply filters (e.g., high severity in main repo)
2. Click "📥 Export Filtered"
3. Share CSV file

### Use Case 3: Batch Processing

**Goal:** Export all smells for automated processing.

```bash
# Export all smells
curl -o all_smells.csv http://localhost:8001/api/export-all-smells

# Process with Python
python analyze_smells.py all_smells.csv
```

### Use Case 4: Compare Detection Tools

```bash
# Export SNUTSJS detections
curl -o snutsjs.csv "http://localhost:8001/api/export-all-smells?tool=SNUTSJS"

# Export Steel detections
curl -o steel.csv "http://localhost:8001/api/export-all-smells?tool=Steel"

# Compare the two CSVs
```

---

## 📝 Column Descriptions

### Selected Smells CSV

| Column | Description | Example |
|--------|-------------|---------|
| `repository` | Repository name | `redux-offline` |
| `file_path` | Path to the file | `/src/__tests__/send.js` |
| `smell_type` | Type of test smell | `Duplicate Assert` |
| `line_numbers` | JSON with start/end lines | `{"startLine":45,"endLine":50}` |
| `severity` | Severity level | `high`, `medium`, `low` |
| `detection_tool` | Tool that detected it | `SNUTSJS`, `Steel` |
| `detected_at` | When it was detected | `2026-01-30 10:30:00` |
| `selected_at` | When it was selected | `2026-01-30 11:45:00` |
| `annotations` | Your notes | `"Needs refactoring"` |
| `priority` | Priority (0-5) | `4` |
| `tags` | Comma-separated tags | `complex,priority` |
| `code_snippet` | Code sample (truncated) | First 500 chars |

### All Smells CSV

| Column | Description | Example |
|--------|-------------|---------|
| `repository` | Repository name | `winston` |
| `file_path` | Path to the file | `/test/logger.test.js` |
| `smell_type` | Type of test smell | `Magic Number` |
| `line_numbers` | JSON with start/end lines | `{"startLine":120,"endLine":120}` |
| `severity` | Severity level | `low` |
| `detection_tool` | Tool that detected it | `Steel` |
| `detected_at` | When it was detected | `2026-01-30 09:15:00` |
| `is_selected` | Selected for study? | `Yes` or `No` |
| `code_snippet` | Code sample (truncated) | First 500 chars |

---

## 🔧 Processing CSV Files

### Python Example

```python
import pandas as pd

# Read exported CSV
df = pd.read_csv('selected_smells_20260130_114500.csv')

# Basic statistics
print(f"Total smells: {len(df)}")
print(f"\nBy repository:")
print(df['repository'].value_counts())

print(f"\nBy smell type:")
print(df['smell_type'].value_counts())

print(f"\nBy detection tool:")
print(df['detection_tool'].value_counts())

# Filter high priority smells
high_priority = df[df['priority'] >= 4]
print(f"\nHigh priority smells: {len(high_priority)}")

# Group by repository and smell type
grouped = df.groupby(['repository', 'smell_type']).size()
print("\nSmells by repo and type:")
print(grouped)
```

### Excel Analysis

1. Open CSV in Excel
2. Use **Data → Filter** to filter columns
3. Create Pivot Table for analysis:
   - Rows: smell_type
   - Values: Count of smell_type
   - Columns: repository

### R Example

```r
library(tidyverse)

# Read CSV
smells <- read_csv("selected_smells.csv")

# Summary statistics
smells %>%
  group_by(smell_type, detection_tool) %>%
  summarize(count = n()) %>%
  arrange(desc(count))

# Plot
ggplot(smells, aes(x = smell_type)) +
  geom_bar(aes(fill = detection_tool)) +
  coord_flip() +
  labs(title = "Test Smells by Type and Tool")
```

---

## ⚠️ Important Notes

### File Size Limits

- **Selected smells**: Usually small (<1 MB for 100-200 smells)
- **All smells**: Can be large (5-10 MB for 10,000+ smells)
- **Code snippets**: Truncated to 500 characters per smell

### Character Encoding

- CSV files use UTF-8 encoding
- Excel users: Use "Data → From Text/CSV" and select UTF-8

### Line Breaks in Data

- Line breaks in code snippets are replaced with spaces
- Use `\n` if you need to preserve line breaks when processing

### Performance

- Export is fast (<1 second for most queries)
- Large exports (10,000+ smells) may take 2-3 seconds
- Filters improve export speed

---

## 🔍 Troubleshooting

### "No smells selected for export"

**Problem:** Trying to export selected smells but none are selected.

**Solution:**
```
1. Go to UI
2. Click on smells
3. Click "Select for Study"
4. Try export again
```

### "No smells found with the specified filters"

**Problem:** Your filters are too restrictive.

**Solution:**
- Remove some filters
- Check filter values (case-sensitive)
- Try exporting all: `/api/export-all-smells`

### CSV Opens Incorrectly in Excel

**Problem:** Columns are misaligned or text is garbled.

**Solution:**
1. Open Excel
2. Go to **Data → From Text/CSV**
3. Select the CSV file
4. Choose **UTF-8** encoding
5. Click **Load**

### Code Snippets Are Truncated

**Problem:** Code snippets are cut off at 500 characters.

**Solution:** This is intentional to keep CSV files manageable. For full code:
- Use the UI to view complete code
- Or query the database directly:
  ```bash
  sqlite3 research_data/research.db "SELECT code_snippet FROM detected_smells WHERE id=123"
  ```

---

## 📊 Example Analysis Workflow

```bash
# 1. Export all smells
curl -o all_smells.csv http://localhost:8001/api/export-all-smells

# 2. Analyze with Python
python << EOF
import pandas as pd

df = pd.read_csv('all_smells.csv')

# Statistics
print("=== Test Smell Analysis ===\n")
print(f"Total Smells: {len(df)}")
print(f"Repositories: {df['repository'].nunique()}")
print(f"Files: {df['file_path'].nunique()}")

print("\n=== By Detection Tool ===")
print(df['detection_tool'].value_counts())

print("\n=== Top 10 Smell Types ===")
print(df['smell_type'].value_counts().head(10))

print("\n=== Selected vs Not Selected ===")
print(df['is_selected'].value_counts())

# Export summary
summary = df.groupby(['repository', 'smell_type']).size().reset_index(name='count')
summary.to_csv('smell_summary.csv', index=False)
print("\nSummary saved to smell_summary.csv")
EOF

# 3. Review summary
cat smell_summary.csv
```

---

## 💡 Tips

1. **Use filters before export** to reduce file size
2. **Export regularly** as you select smells
3. **Add annotations** before export for better context
4. **Version control** your CSV exports (git, naming with dates)
5. **Backup** important selections before clearing database

---

## 🚀 Quick Reference

```bash
# Export selected smells
curl -O http://localhost:8001/api/export-selected-smells

# Export all smells
curl -o all.csv http://localhost:8001/api/export-all-smells

# Export with filters
curl -o filtered.csv "http://localhost:8001/api/export-all-smells?repo=X&tool=Y"

# Check what you'll export (without downloading)
curl -I http://localhost:8001/api/export-selected-smells
```

Happy exporting! 📊✨
