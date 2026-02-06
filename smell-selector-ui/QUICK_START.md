# Quick Start Guide - Smell Selector UI

## 🚀 3 Ways to Start the Application

### Option 1: Automatic (Recommended) ⭐

Start both backend and frontend with a single command:

```bash
cd smell-selector-ui
./start.sh
```

**What it does:**
- ✓ Checks prerequisites (Python 3, Node.js, npm)
- ✓ Verifies database exists
- ✓ Installs dependencies (only first time)
- ✓ Starts backend on http://localhost:8001
- ✓ Starts frontend on http://localhost:5173
- ✓ Opens browser automatically

**To stop:** Press `Ctrl+C`

---

### Option 2: Separate Scripts

Start backend and frontend in different terminals:

**Terminal 1 - Backend:**
```bash
cd smell-selector-ui
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd smell-selector-ui
./start-frontend.sh
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

### Option 3: Manual

**Terminal 1 - Backend:**
```bash
cd smell-selector-ui/backend

# First time only
pip install -r requirements.txt

# Every time
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd smell-selector-ui/frontend

# First time only
npm install

# Every time
npm run dev
```

---

## ✅ Prerequisites

Make sure you have:

1. **Python 3.8+**
   ```bash
   python3 --version
   ```

2. **Node.js 18+**
   ```bash
   node --version
   ```

3. **Database with smells**
   ```bash
   ls ../research_data/research.db
   ```

   If database doesn't have smells, import them:
   ```bash
   cd ../llm-refactor-pipeline
   python -m llm_refactor
   llm-refactor> db import-smells
   ```

---

## 🎯 What You'll See

### Frontend (http://localhost:5173)
- List of detected test smells
- Filters:
  - **Repositories**: All repositories with smells
  - **Smell Types**: All 23 detected smell types (★ marks primary research smells)
  - **Detection Tools**: SNUTSJS and Steel
  - **Selection Status**: Selected/Not Selected
- Click on a smell to see details and code

### Backend API (http://localhost:8001/docs)
Interactive API documentation with all endpoints

---

## 📊 Current Data

After importing smells:
- **9,682 total smells**
- **12 repositories**
- **23 unique smell types**
- **2 detection tools** (SNUTSJS, Steel)

Top smells:
1. ★ Duplicate Assert (2,392)
2. ★ Magic Number (1,940)
3. Eager Test (1,055)
4. Global Variable (935)
5. ★ Lazy Test (820)

---

## 🔧 Troubleshooting

### "Database not found"
```bash
# Import smells first
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db import-smells
```

### "ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint"
This error occurs when the database was created before the schema fix. **Solution**:

```bash
# Fix the database schema (keeps your data)
sqlite3 ../research_data/research.db
> CREATE UNIQUE INDEX IF NOT EXISTS uq_ui_metadata_smell
  ON smell_ui_metadata(detected_smell_id);
> .quit

# Restart the backend
cd smell-selector-ui
./start.sh
```

**Why this happens**: The `smell_ui_metadata` table needs a UNIQUE constraint on `detected_smell_id` for the selection feature to work properly.

### "Port already in use"
```bash
# Backend (8001)
lsof -ti:8001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### "Module not found"
```bash
# Backend
cd smell-selector-ui/backend
pip install -r requirements.txt

# Frontend
cd smell-selector-ui/frontend
rm -rf node_modules package-lock.json
npm install
```

### "Filters show old data (steel, snutsjs)"
This was a bug! Now fixed:
- Frontend loads filter options dynamically from `/api/filter-options`
- Shows correct names: **SNUTSJS** and **Steel**
- Shows all 23 smell types with counts
- Primary research smells marked with ★

---

## 📝 Features

### Current Features
- ✅ View all detected smells
- ✅ Filter by repository, smell type, tool, status
- ✅ View smell details and code snippets
- ✅ Select smells for study
- ✅ Add annotations and priorities
- ✅ Dynamic filters loaded from database

### Future Features
- 🔄 Code syntax highlighting (Prism.js)
- 🔄 Diff view (before/after refactoring)
- 🔄 Batch operations
- 🔄 Export to CSV
- 🔄 Integration with refactoring pipeline

---

## 🔗 Related Commands

### Import smells from CSV
```bash
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db import-smells
```

### Validate imported data
```bash
llm-refactor> db validate-import
```

### View database stats
```bash
llm-refactor> db stats
```

### Start UI from pipeline
```bash
llm-refactor> ui
```

---

## 💡 Tips

1. **Use the automatic script** (`./start.sh`) - it's the easiest!
2. **Check logs** if something fails:
   - Backend: `/tmp/smell-selector-backend.log`
   - Frontend: `/tmp/smell-selector-frontend.log`
3. **API Documentation** is your friend: http://localhost:8001/docs
4. **Filter by primary smells** (marked with ★) for research focus
5. **Select smells** to add them to your study set

---

## 📞 Need Help?

- **API not responding?** Make sure backend is running on port 8001
- **Frontend not loading?** Check console for errors (F12)
- **Database issues?** Run `db validate-import` to check integrity
- **Wrong data in filters?** Clear browser cache and reload

Happy smell hunting! 🔍✨
