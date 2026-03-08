# DHS Procurement Research API - Quick Start Guide

## What You Have

A comprehensive system for tracking Department of Homeland Security vendors, contracts, and spending that combines:

1. **310 vendor profiles** from EFF's January 2026 dataset
2. **Live government database queries** (USASpending.gov, FPDS, SAM.gov)
3. **Python API and client library** for programmatic access
4. **Standalone research tool** that works without installing the full API

## Files Included

```
procurement_api/
├── main.py              # Full FastAPI server with all endpoints
├── gov_queries.py       # Government database query module
├── client.py            # Python client library for easy usage
├── demo.py              # Standalone demo (no API server needed)
├── requirements.txt     # Python dependencies
└── README.md           # Complete documentation
```

## Quick Start (3 Options)

### Option 1: Standalone Tool (No Setup Required)

Run the demo script that uses just pandas:

```bash
python demo.py
```

This will:
- Load the entire EFF dataset
- Show example searches and filters
- Export results to CSV
- Display vendor profiles

**Perfect for**: One-off research, exploring the dataset, quick exports

### Option 2: Python Client Library

Use the client library in your own scripts:

```python
from client import DHSProcurementClient

client = DHSProcurementClient()  # Will connect to API when running

# Investigate a vendor
investigation = client.investigate_vendor("Palantir")

# Track a technology
surveillance = client.track_technology("facial recognition")

# Build FOIA target list
targets = client.build_foia_target_list(category="biometric", prime_only=True)
```

**Perfect for**: Jupyter notebooks, investigation scripts, automation

### Option 3: Full API Server

Run the complete REST API with live government queries:

```bash
# Install dependencies (if FastAPI not installed)
pip install -r requirements.txt

# Start the server
python main.py
```

Then access at `http://localhost:8000/docs` for interactive documentation.

**Perfect for**: Web applications, multiple users, integration with other tools

## Common Use Cases

### 1. Search for Vendors

```python
# Using demo.py
researcher = ProcurementResearcher("path/to/dataset.xlsx")
results = researcher.search_vendors("surveillance", ai_only=True)

# Using client.py (with API running)
client = DHSProcurementClient()
results = client.search_vendors("surveillance", ai_only=True)

# Using API directly
curl "http://localhost:8000/vendors?q=surveillance&ai_only=true"
```

### 2. Get Vendor Details

```python
# demo.py
vendor = researcher.get_vendor_detail("TECH151")  # Palantir
researcher.print_vendor(vendor)

# client.py
vendor = client.get_vendor("TECH151")

# API
curl "http://localhost:8000/vendors/TECH151"
```

### 3. Query Live Contracts

**Note**: Requires full API (Option 3) and network access

```python
# client.py
contracts = client.get_live_contracts("Palantir Technologies")
history = client.get_contract_history("Palantir Technologies", 
                                     start_date="2023-01-01")

# API
curl "http://localhost:8000/live/contracts/Palantir%20Technologies"
curl "http://localhost:8000/live/history/Anduril?start_date=2023-01-01"
```

### 4. Compare Multiple Vendors

```python
# client.py
comparison = client.compare_vendors([
    "Palantir Technologies",
    "Clearview AI", 
    "Anduril"
])

# API
curl "http://localhost:8000/live/compare?vendors=Palantir,Anduril,Clearview%20AI"
```

### 5. Export for Analysis

```python
# demo.py
results = researcher.search_vendors("surveillance", limit=200)
researcher.export_to_csv(results, "surveillance_vendors.csv")

# Then analyze in pandas, Excel, or your preferred tool
import pandas as pd
df = pd.read_csv("surveillance_vendors.csv")
print(df['Categories of Products/Services'].value_counts())
```

## Key Dataset Fields

Each vendor profile includes:

- **Company Name** - Official business name
- **Ref** - Unique identifier (e.g., TECH002)
- **Categories** - Products/services offered
- **Corporate Summary** - Company description
- **AI/ML in Marketing** - Whether they advertise AI capabilities
- **DHS Prime Contractor** - If they have direct DHS contracts
- **Border Expo/Tech Summit** - Industry event participation
- **Parent Company** - Corporate ownership
- **Related Companies** - Subsidiaries, partners, distributors
- **Official DHS Programs** - Specific programs they're involved with
- **Agency Contracts** - Which federal agencies they contract with
- **USASpending Link** - Direct link to government contract data
- **FPDS Link** - Federal procurement database search

## Research Workflows

### Building a FOIA Request List

```python
from client import DHSProcurementClient

client = DHSProcurementClient()

# Get all vendors in a category with contracts
targets = client.build_foia_target_list(
    category="facial recognition",
    prime_only=True
)

# For each target, get their contract history
for target in targets:
    print(f"\n{target['vendor_name']}")
    history = client.get_contract_history(target['vendor_name'])
    
    # Use contract IDs for FOIA requests
    for contract in history.get('contracts', [])[:5]:
        print(f"  Contract ID: {contract.get('Award ID')}")
        print(f"  Amount: ${contract.get('Award Amount')}")
```

### Tracking Technology Proliferation

```python
# Track specific technology
results = client.track_technology("license plate reader")

# See which vendors offer it
print(f"Found {results['vendors']['count']} LPR vendors")

# Check their DHS involvement
for vendor in results['vendors']['vendors']:
    if vendor['is_prime_contractor']:
        print(f"{vendor['name']} - PRIME CONTRACTOR")
        detail = client.get_vendor(vendor['ref'])
        print(f"  Programs: {detail.get('dhs_programs')}")
```

### Mapping Corporate Relationships

```python
# Find parent companies and subsidiaries
vendor = client.get_vendor("TECH002")  # Accenture

print(f"Parent: {vendor.get('parent_company')}")
print(f"Related: {vendor.get('related_companies')}")

# Check if related companies also have contracts
if vendor.get('related_companies'):
    for company in vendor['related_companies'].split(','):
        search = client.search_vendors(company.strip(), limit=1)
        if search['count'] > 0:
            print(f"  {company} - ALSO IN DATABASE")
```

## Tips for Investigative Journalism

1. **Start broad, narrow down**: Search with general terms first, then add filters

2. **Cross-reference**: Compare dataset info with live contract data using `/enriched/` endpoint

3. **Export for analysis**: Use CSV exports for timeline analysis, spending totals, network mapping

4. **Track changes**: Re-query live data periodically to catch new contracts

5. **Follow the links**: Every vendor profile includes USASpending and FPDS links

6. **Industry events matter**: Check industry day participation to see who has inside access

7. **AI flag is significant**: Vendors marking AI/ML may be involved in surveillance tech

8. **Prime contractor status**: Prime contractors have direct relationships vs. subcontractors

## Data Sources

- **EFF Dataset**: January 6, 2026 snapshot from EFF's research
- **USASpending.gov**: Official federal spending data (updated daily)
- **FPDS.gov**: Federal Procurement Data System
- **SAM.gov**: System for Award Management (contract opportunities)

## Methodology

This tool implements the research methodology from EFF's guide "The Homeland Security Spending Trail" (included in your uploads). The guide explains:

- How to search FPDS and USASpending
- Understanding contract types and award data
- Finding vendor relationships
- Using SAM.gov for upcoming contracts
- Navigating complex corporate structures

## Network Requirement

- **Standalone tool (demo.py)**: No network required, works offline
- **Live queries (/live/ endpoints)**: Requires internet to query USASpending.gov API
- **Enriched profiles**: Combines offline dataset + live queries

## Next Steps

1. **Explore the dataset**: Run `python demo.py` to see what's available

2. **Try specific searches**: Look for vendors/technologies relevant to your investigations

3. **Set up the API**: If you need live queries, install FastAPI and start the server

4. **Integrate with your workflow**: Use the client library in your existing scripts

5. **Export and analyze**: Generate CSV files for deeper analysis in your tools of choice

## Support

- **Dataset questions**: Consult EFF's methodology guide (in your uploads)
- **API questions**: See README.md for complete endpoint documentation
- **Government data questions**: Visit USASpending.gov, FPDS.gov, SAM.gov help pages

## Example Investigations to Try

1. **Surveillance technology**: Search for "facial recognition", "surveillance", "biometric"

2. **AI in law enforcement**: Filter by AI/ML flag and look at DHS programs

3. **Border technology**: Search for "border", "CBP", check Border Expo attendees

4. **Corporate concentration**: Find parent companies with multiple subsidiaries in dataset

5. **Emerging vendors**: Look for non-prime contractors with recent contracts

## Remember

This is a research tool built on public data. Always:
- Verify information through multiple sources
- Check contract dates and amounts
- Consider corporate relationships
- Follow up with FOIAs when you need primary documents
- Respect data licenses and cite sources appropriately
