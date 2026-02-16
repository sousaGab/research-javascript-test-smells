# CSV Format with Line Breaks

## 🔧 How Line Breaks are Preserved

The CSV export now **preserves line breaks** in the code snippet column using standard CSV escaping.

---

## 📝 CSV Standard (RFC 4180)

When a field contains:
- Line breaks (`\n`)
- Commas (`,`)
- Double quotes (`"`)

The Python `csv.writer` automatically:
1. Wraps the field in double quotes
2. Escapes internal quotes by doubling them (`"` → `""`)
3. Preserves line breaks inside the quoted field

---

## 📊 Example Output

### Simple Code (No Line Breaks):
```csv
repository,file_path,smell_type,code_snippet
redux-offline,/test.js,Magic Number,const timeout = 5000;
```

### Code with Line Breaks:
```csv
repository,file_path,smell_type,code_snippet
redux-offline,/test.js,Duplicate Assert,"expect(result).toBe(true);
expect(result).toBe(true);"
```

**Note:** The entire code snippet is wrapped in quotes, and the line break is preserved.

### Code with Quotes and Line Breaks:
```csv
repository,file_path,smell_type,code_snippet
winston,/logger.js,Assertion Roulette,"const message = ""Hello"";
console.log(message);
expect(message).toBe(""Hello"");"
```

**Note:** Internal quotes are doubled (`""`) to escape them.

---

## 🔍 Full Example CSV

```csv
repository,file_path,smell_type,line_numbers,severity,detection_tool,detected_at,selected_at,annotations,priority,tags,code_snippet
redux-offline,/src/__tests__/send.js,Duplicate Assert,"{'startLine':45,'endLine':50}",high,Steel,2026-01-30 10:30:00,2026-01-30 11:45:00,Needs refactoring,4,"complex,priority","test('should validate', () => {
  expect(result).toBe(true);
  expect(result).toBe(true);
});"
winston,/test/logger.test.js,Magic Number,"{'startLine':120,'endLine':120}",low,SNUTSJS,2026-01-30 09:15:00,2026-01-30 12:00:00,Easy fix,2,quick,"const timeout = 5000;"
inferno,/src/__tests__/render.js,Assertion Roulette,"{'startLine':89,'endLine':95}",high,Steel,2026-01-30 08:00:00,2026-01-30 13:00:00,Complex test case,5,"critical,blocking","describe('render', () => {
  it('renders component', () => {
    const result = render(<App />);
    expect(result).toBeDefined();
    expect(result.innerHTML).toContain('Hello');
    expect(result.querySelector('div')).toBeTruthy();
  });
});"
```

---

## 💻 Reading CSV with Line Breaks

### Python (Pandas):
```python
import pandas as pd

# Read CSV - pandas handles quoted fields automatically
df = pd.read_csv('selected_smells.csv')

# Access code snippet with preserved line breaks
for idx, row in df.iterrows():
    print(f"=== {row['smell_type']} ===")
    print(row['code_snippet'])
    print()
```

**Output:**
```
=== Duplicate Assert ===
test('should validate', () => {
  expect(result).toBe(true);
  expect(result).toBe(true);
});

=== Assertion Roulette ===
describe('render', () => {
  it('renders component', () => {
    const result = render(<App />);
    expect(result).toBeDefined();
    expect(result.innerHTML).toContain('Hello');
    expect(result.querySelector('div')).toBeTruthy();
  });
});
```

### Python (Standard Library):
```python
import csv

with open('selected_smells.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"File: {row['file_path']}")
        print(f"Code:\n{row['code_snippet']}\n")
```

### Excel:

**Method 1: Import Data**
1. Open Excel
2. Go to **Data → From Text/CSV**
3. Select the CSV file
4. Excel automatically handles quoted fields
5. Code snippets will show with line breaks in cells

**Method 2: Direct Open**
1. Right-click CSV file
2. **Open With → Excel**
3. Line breaks are preserved in cells
4. Use `Alt+Enter` to see them clearly

**Viewing Multi-line Cells:**
- Select cell with code snippet
- Enable **Wrap Text** (Home → Alignment → Wrap Text)
- Or double-click cell to edit and see line breaks

### R:
```r
library(readr)

# Read CSV
smells <- read_csv("selected_smells.csv")

# View code snippet with line breaks
smells %>%
  select(file_path, smell_type, code_snippet) %>%
  head()

# Print with line breaks
cat(smells$code_snippet[1])
```

### Node.js:
```javascript
const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('selected_smells.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(`File: ${row.file_path}`);
    console.log(`Code:\n${row.code_snippet}\n`);
  });
```

---

## 🔧 Technical Details

### Python csv.writer Behavior:

```python
import csv
import io

output = io.StringIO()
writer = csv.writer(output)

# Write row with line breaks
writer.writerow([
    'redux-offline',
    '/test.js',
    'Duplicate Assert',
    'test("example", () => {\n  expect(x).toBe(1);\n  expect(x).toBe(1);\n});'
])

# Output will be properly quoted:
# redux-offline,/test.js,Duplicate Assert,"test(""example"", () => {
#   expect(x).toBe(1);
#   expect(x).toBe(1);
# });"
```

**Key Points:**
- ✅ Line breaks (`\n`) are preserved inside quotes
- ✅ No manual escaping needed
- ✅ Standard CSV format (RFC 4180)
- ✅ Compatible with all CSV readers

---

## 🎯 Why This Matters

### Before (Line Breaks Removed):
```csv
code_snippet
test('example', () => { expect(x).toBe(1); expect(x).toBe(1); });
```
❌ Hard to read
❌ Lost code structure
❌ Difficult to analyze

### After (Line Breaks Preserved):
```csv
code_snippet
"test('example', () => {
  expect(x).toBe(1);
  expect(x).toBe(1);
});"
```
✅ Easy to read
✅ Code structure preserved
✅ Ready for analysis

---

## 📊 Field Quoting Rules

The Python CSV writer quotes fields when they contain:

| Character | Needs Quoting | Example |
|-----------|--------------|---------|
| Comma (`,`) | ✅ Yes | `"hello, world"` |
| Line break (`\n`) | ✅ Yes | `"line1\nline2"` |
| Double quote (`"`) | ✅ Yes (doubled) | `"He said ""hi"""` |
| Regular text | ❌ No | `simple_text` |

---

## 🧪 Testing the Export

### Test 1: Simple Code
```bash
# Select a smell with single-line code
curl http://localhost:8001/api/export-selected-smells > test.csv
head -5 test.csv
```

### Test 2: Multi-line Code
```bash
# Select a smell with multi-line code (e.g., Assertion Roulette)
curl http://localhost:8001/api/export-selected-smells > test.csv

# View in Python to see line breaks
python3 << EOF
import csv
with open('test.csv', 'r') as f:
    reader = csv.DictReader(f)
    row = next(reader)
    print("Code snippet:")
    print(row['code_snippet'])
EOF
```

### Test 3: Import in Excel
```bash
# Export CSV
curl http://localhost:8001/api/export-selected-smells > smells.csv

# Open in Excel:
# 1. Data → From Text/CSV → smells.csv
# 2. Select UTF-8 encoding
# 3. Click Load
# 4. Double-click a code_snippet cell
# You should see line breaks!
```

---

## 💡 Pro Tips

### 1. Viewing in Terminal
```bash
# Use column to format CSV
column -t -s, selected_smells.csv | less -S

# Or use csvkit
csvlook selected_smells.csv | less -S
```

### 2. Extract Just Code Snippets
```bash
# Python one-liner
python3 -c "import csv; [print(r['code_snippet'], '\n---\n') for r in csv.DictReader(open('selected_smells.csv'))]"
```

### 3. Count Line Breaks in Code
```python
import pandas as pd
df = pd.read_csv('selected_smells.csv')
df['line_count'] = df['code_snippet'].str.count('\n') + 1
print(df[['smell_type', 'line_count']].head())
```

### 4. Format Code for Display
```python
import pandas as pd

df = pd.read_csv('selected_smells.csv')

for idx, row in df.iterrows():
    print(f"\n{'='*60}")
    print(f"Smell: {row['smell_type']}")
    print(f"File: {row['file_path']}")
    print(f"{'='*60}")
    print(row['code_snippet'])
```

---

## 🔍 Common Issues and Solutions

### Issue 1: Line breaks show as `\n` in Excel

**Problem:** Excel not parsing CSV correctly.

**Solution:**
1. Don't double-click CSV to open
2. Use **Data → From Text/CSV**
3. Select **UTF-8** encoding
4. Line breaks will render properly

### Issue 2: Extra quotes in output

**Problem:** Seeing `""` instead of `"` in code.

**Solution:** This is correct CSV escaping! When parsing:
- Python: Handles automatically
- Excel: Handles automatically
- Manual: Replace `""` with `"`

### Issue 3: Code appears in multiple rows

**Problem:** CSV reader splitting on line breaks.

**Solution:** Use proper CSV parser:
```python
# ❌ Wrong
with open('file.csv') as f:
    for line in f:  # Don't do this!
        ...

# ✅ Correct
import csv
with open('file.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ...
```

---

## 📋 Summary

✅ **Line breaks are now preserved** in CSV exports
✅ Uses **standard CSV quoting** (RFC 4180)
✅ Compatible with **all CSV readers**
✅ Works in **Python, R, Excel, Node.js**
✅ No data truncation
✅ Code structure maintained

**Example CSV row:**
```csv
repository,code_snippet
winston,"describe('logger', () => {
  it('logs message', () => {
    logger.info('test');
    expect(output).toBe('test');
  });
});"
```

The code is properly quoted and line breaks are preserved! 🎉
