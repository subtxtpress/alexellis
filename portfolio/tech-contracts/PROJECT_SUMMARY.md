# DHS Procurement Research API - Project Summary

A comprehensive procurement research system that combines the Electronic Frontier Foundation's vendor dataset with live government database queries. This provides both historical vendor profiles AND real-time contract data.

## Core Components

### 1. FastAPI Server (`main.py`)
Full REST API with 15+ endpoints:
- **Dataset queries**: Search vendors, filter by categories, get detailed profiles
- **Live government queries**: Real-time USASpending.gov data
- **Enriched profiles**: Combines dataset + live data
- **Reference data**: Categories, statistics, industry events

Auto-generates interactive documentation at `/docs`

### 2. Government Query Service (`gov_queries.py`)
Interfaces with federal procurement databases:
- **USASpending.gov API**: Live contract data, spending totals, history
- **FPDS.gov**: Federal Procurement Data System (provides search URLs)
- **SAM.gov**: Contract opportunities (provides search URLs)
- Vendor comparison tools
- Contract history tracking

### 3. Python Client Library (`client.py`)
Easy-to-use client for your scripts:
- Simple methods for all common queries
- Investigative journalism helpers (build FOIA lists, track technology, etc.)
- No need to craft API requests manually

### 4. Standalone Demo Tool (`demo.py`)
Works without FastAPI installation:
- Search and filter vendors
- Export to CSV
- Display detailed profiles
- Perfect for quick research sessions

## Key Features

### Dataset Coverage
- **310 vendor profiles** with detailed information
- **870 industry day participation records**
- **Top 100 DHS contractors** (2006-2024)
- **Homeland Security Technology Consortium** members
- Corporate relationships (parents, subsidiaries, partners)
- AI/ML usage tracking
- Direct links to USASpending.gov and FPDS.gov

### Search & Filter
- Full-text search across all fields
- Filter by:
  - Product/service category
  - DHS prime contractor status
  - AI/ML usage
  - Industry event participation
  - Contract history
- Limit and sort results

### Live Government Data
- Query USASpending.gov API in real-time
- Get contract history with date ranges
- Compare spending across multiple vendors
- Generate FPDS/SAM.gov search URLs
- Combine dataset + live data in enriched profiles

## Use Cases

### For Investigative Journalists

**Track vendor relationships with DHS:**
```python
# Get complete vendor profile
vendor = client.get_vendor("TECH151")  # Palantir

# Get their live contracts
contracts = client.get_live_contracts("Palantir Technologies")

# See their contract history
history = client.get_contract_history(
    "Palantir Technologies",
    start_date="2020-01-01"
)
```

**Research specific technologies:**
```python
# Find all facial recognition vendors
vendors = client.search_vendors("facial recognition")

# Filter for those with active contracts
for v in vendors['vendors']:
    if v['is_prime_contractor']:
        print(f"{v['name']} - Prime contractor")
```

**Map corporate relationships:**
```python
# Get vendor details
vendor = client.get_vendor("TECH002")

# See parent companies and subsidiaries
print(f"Parent: {vendor['parent_company']}")
print(f"Related: {vendor['related_companies']}")
```

### For FOIA Requests

**Build target lists:**
```python
# Get all vendors in a category
targets = client.build_foia_target_list(
    category="surveillance",
    prime_only=True
)

# Get contract IDs for FOIA requests
for target in targets:
    history = client.get_contract_history(target['vendor_name'])
    # Use contract IDs in your FOIAs
```

### For Dataset Analysis

**Export for visualization:**
```python
# Export surveillance vendors
researcher = ProcurementResearcher("dataset.xlsx")
results = researcher.search_vendors("surveillance", limit=500)
researcher.export_to_csv(results, "surveillance_vendors.csv")

# Analyze in pandas/Excel/Tableau
```

## Quick Start

### Option 1: Just Explore the Data
```bash
python demo.py
```
No setup required, works immediately.

### Option 2: Use as a Library
```python
from client import DHSProcurementClient

client = DHSProcurementClient()
results = client.search_vendors("your query")
```

### Option 3: Run Full API
```bash
pip install -r requirements.txt
python main.py
# Visit http://localhost:8000/docs
```

## Example Queries

### API Endpoints

```bash
# Search vendors
GET /vendors?q=surveillance&ai_only=true

# Get vendor details  
GET /vendors/TECH151

# Live contracts
GET /live/contracts/Palantir%20Technologies

# Contract history
GET /live/history/Anduril?start_date=2023-01-01

# Compare vendors
GET /live/compare?vendors=Palantir,Clearview AI,Anduril

# Enriched profile (dataset + live data)
GET /enriched/TECH002

# Get all prime contractors
GET /prime-contractors

# Get all AI vendors
GET /ai-vendors

# Full text search
GET /search?q=facial+recognition

# Dataset statistics
GET /stats
```

### Python Client

```python
from client import DHSProcurementClient

client = DHSProcurementClient()

# Search
results = client.search_vendors("drone", prime_only=True)

# Get details
vendor = client.get_vendor("TECH013")  # Anduril

# Live data
contracts = client.get_live_contracts("Anduril")

# Compare
comparison = client.compare_vendors([
    "Palantir Technologies",
    "Anduril",
    "Clearview AI"
])

# Investigate
investigation = client.investigate_vendor("Palantir")

# Track technology
surveillance = client.track_technology("facial recognition")

# FOIA targets
targets = client.build_foia_target_list(
    category="biometric",
    prime_only=True
)
```

### Standalone Tool

```python
from demo import ProcurementResearcher

researcher = ProcurementResearcher("dataset.xlsx")

# Search
results = researcher.search_vendors("surveillance", ai_only=True)

# Get details
vendor = researcher.get_vendor_detail("TECH151")

# Print formatted profile
researcher.print_vendor(vendor)

# Export
researcher.export_to_csv(results, "output.csv")

# Statistics
stats = researcher.get_stats()
```

## What Makes This Powerful

### 1. Combined Data Sources
- EFF's curated research (vendor relationships, programs, events)
- Live government APIs (current contracts, spending totals)
- All in one place with unified interface

### 2. Multiple Access Methods
- REST API for web applications
- Python client for scripts and notebooks
- Standalone tool for quick research
- Direct CSV export for analysis tools

### 3. Research-Focused Design
Built specifically for investigative journalism:
- Track technologies across vendors
- Map corporate relationships
- Build FOIA target lists
- Monitor contract history
- Export for visualization

### 4. No Configuration Required
- No database setup
- No API keys needed (for dataset queries)
- Works offline (standalone tool)
- Add live data when you need it

## Files You're Getting

```
procurement_api/
├── main.py              # Full REST API (20KB, 400+ lines)
├── gov_queries.py       # Government database interfaces (12KB)
├── client.py            # Python client library (10KB)
├── demo.py              # Standalone research tool (8KB)
├── requirements.txt     # Python dependencies
├── README.md           # Complete documentation (9KB)
├── QUICKSTART.md       # Getting started guide (9KB)
└── surveillance_vendors.csv  # Sample export (generated by demo)
```

## Data Source Attribution

**Dataset**: Electronic Frontier Foundation & Heinrich Boell Foundation
- Published: January 6, 2026
- URL: https://www.eff.org/deeplinks/2026/01/homeland-security-spending-trail
- Methodology guide included in the uploads

**Live Data**: U.S. Government APIs
- USASpending.gov (free public API)
- FPDS.gov (web interface, no API)
- SAM.gov (requires auth for API)

## Technical Details

**Built with:**
- FastAPI (modern Python web framework)
- Pandas (data analysis)
- Requests (HTTP client)
- OpenPyXL (Excel file handling)

**Features:**
- Automatic API documentation (Swagger/OpenAPI)
- Rate limiting for government APIs
- Error handling
- CSV export
- JSON responses

**Requirements:**
- Python 3.8+
- pandas, openpyxl (always required)
- fastapi, uvicorn (only for full API)
- requests (only for live queries)

## What You Can Do Now

1. **Run the demo** to see what's in the dataset:
   ```bash
   python demo.py
   ```

2. **Search**:
   - Surveillance technology vendors
   - Facial recognition systems
   - Border technology contractors
   - AI-powered tools
   - Biometric systems

3. **Export data** for analysis in your preferred tools

4. **Set up the full API** when you need live government data

5. **Integrate with your workflow** using the client library

## Next Steps for Development

If you want to extend this:

1. **Add more government data sources**
   - Contract modification tracking
   - Agency budget data
   - Grant programs

2. **Add analysis features**
   - Spending trends over time
   - Network visualization of corporate relationships
   - Automated FOIA letter generation

3. **Add alerting**
   - Monitor for new contracts
   - Track vendor changes
   - Alert on technology keywords

4. **Add authentication**
   - User accounts
   - Saved searches
   - Investigation workspace

## Questions?

- **How do I find a specific vendor?** Search by name or use their REF ID
- **Can I use this offline?** Yes, demo.py works without internet
- **Do I need API keys?** No for dataset; USASpending.gov is free
- **Can I export data?** Yes, to CSV or access raw JSON
- **How current is the data?** Dataset from Jan 2026; live queries are real-time
- **Can I add vendors?** The dataset is read-only, but you can augment with live queries

## This Tool Is For You If...

✓ You're investigating homeland security vendors  
✓ You need to track surveillance technology  
✓ You're building FOIA requests  
✓ You want to map corporate relationships  
✓ You need contract history and spending data  
✓ You're researching AI in law enforcement  
✓ You want to understand the surveillance-industrial complex  

This is everything you need to start tracking homeland security procurement. The data is already loaded, the tools are ready to use, and the documentation shows you exactly how to use it for investigative journalism.