# DHS Procurement Research API

A comprehensive API for tracking Department of Homeland Security vendors, contracts, and spending. Combines the Electronic Frontier Foundation's vendor dataset with live queries to government procurement databases.

## Features

### 📊 Dataset Integration
- **310 vendor profiles** from EFF's research
- **870 industry day participation records**
- **Top 100 DHS contractors** (2006-2024)
- **Homeland Security Technology Consortium** membership data
- AI/ML vendor tracking
- Corporate relationship mapping

### 🔴 Live Government Queries
- **USASpending.gov API** - Real-time contract data
- **FPDS.gov** - Federal Procurement Data System search URLs
- **SAM.gov** - Contract opportunity searches
- Vendor comparison tools
- Contract history tracking

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Start the API
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API documentation is automatically available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Endpoints

### Dataset Queries

#### Search Vendors
```bash
GET /vendors?q=surveillance&prime_only=true
```
Search the vendor database with filters for categories, prime contractors, AI/ML usage.

#### Get Vendor Details
```bash
GET /vendors/TECH002
```
Get complete profile for a specific vendor including programs, relationships, links.

#### List Prime Contractors
```bash
GET /prime-contractors
```
Get all DHS prime contractors.

#### AI/ML Vendors
```bash
GET /ai-vendors
```
List vendors marketing AI/ML capabilities.

#### Full Text Search
```bash
GET /search?q=facial+recognition
```
Search across all vendor data fields.

### Live Government Queries

#### Query Live Contracts
```bash
GET /live/contracts/Palantir%20Technologies
```
Real-time query to USASpending.gov for active contracts.

#### Contract History
```bash
GET /live/history/Anduril?start_date=2023-01-01&end_date=2024-12-31
```
Get complete contract history for a date range.

#### Compare Vendors
```bash
GET /live/compare?vendors=Palantir,Clearview AI,Anduril
```
Compare contract spending across multiple vendors.

#### Enriched Vendor Profile
```bash
GET /enriched/TECH002
```
Combines EFF dataset with live USASpending.gov data.

### Reference Data

#### Categories
```bash
GET /categories
```
List all product/service categories.

#### Industry Events
```bash
GET /industry-events?company=Palantir
```
Track industry day participation.

#### Statistics
```bash
GET /stats
```
Dataset statistics and metadata.

## Example Use Cases

### Investigative Journalism

**Track a specific vendor's government relationships:**
```python
import requests

# Get base profile
vendor = requests.get("http://localhost:8000/vendors/TECH172").json()

# Get live contracts
contracts = requests.get(
    "http://localhost:8000/live/contracts/RTX"
).json()

# Check industry day participation
events = requests.get(
    "http://localhost:8000/industry-events?company=Raytheon"
).json()
```

**Research surveillance technology vendors:**
```python
# Search for surveillance vendors
vendors = requests.get(
    "http://localhost:8000/search?q=surveillance&limit=50"
).json()

# Filter for AI-powered surveillance
ai_surveillance = requests.get(
    "http://localhost:8000/vendors?category=surveillance&ai_only=true"
).json()
```

### FOIA Support

**Build target list for FOIA requests:**
```python
# Get all prime contractors
primes = requests.get("http://localhost:8000/prime-contractors").json()

# Get their contract history
for contractor in primes['contractors']:
    history = requests.get(
        f"http://localhost:8000/live/history/{contractor['name']}"
    ).json()
    # Use history to identify specific contracts for FOIA
```

### Dataset Analysis

**Export vendor data for analysis:**
```python
import pandas as pd

# Get all vendors
response = requests.get("http://localhost:8000/vendors?limit=500")
vendors = response.json()['vendors']

# Convert to DataFrame
df = pd.DataFrame(vendors)

# Analyze by category, AI usage, etc.
category_counts = df['categories'].value_counts()
ai_percentage = df['uses_ai_ml'].sum() / len(df) * 100
```

## Data Sources

### EFF Dataset
- **Source**: Electronic Frontier Foundation
- **Updated**: January 6, 2026
- **Methodology**: https://www.eff.org/deeplinks/2026/01/homeland-security-spending-trail

### Government APIs
- **USASpending.gov**: Official source for federal spending data
- **FPDS.gov**: Federal Procurement Data System
- **SAM.gov**: System for Award Management

## Important Notes

### Rate Limiting
- Live government queries are rate-limited (0.5s between requests)
- For bulk analysis, download data and query locally
- USASpending.gov has its own rate limits

### API Availability
- FPDS.gov does not provide a public API (we provide search URLs)
- SAM.gov requires authentication for API access
- USASpending.gov has a free public API

### Data Freshness
- EFF dataset: Static snapshot from January 2026
- Live queries: Real-time data from government APIs
- Use `/enriched/` endpoints for best of both

## Integration Examples

### Python Client
```python
class DHSProcurementClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def search_vendors(self, query, **filters):
        params = {"q": query, **filters}
        response = requests.get(f"{self.base_url}/vendors", params=params)
        return response.json()
    
    def get_vendor_contracts(self, vendor_name):
        response = requests.get(
            f"{self.base_url}/live/contracts/{vendor_name}"
        )
        return response.json()
    
    def compare_vendors(self, vendor_list):
        vendors_str = ",".join(vendor_list)
        response = requests.get(
            f"{self.base_url}/live/compare",
            params={"vendors": vendors_str}
        )
        return response.json()

# Usage
client = DHSProcurementClient()
results = client.search_vendors("surveillance", ai_only=True)
```

### JavaScript/Node.js
```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:8000';

async function searchVendors(query, filters = {}) {
    const response = await axios.get(`${API_BASE}/vendors`, {
        params: { q: query, ...filters }
    });
    return response.data;
}

async function getLiveContracts(vendorName) {
    const response = await axios.get(
        `${API_BASE}/live/contracts/${encodeURIComponent(vendorName)}`
    );
    return response.data;
}

// Usage
const vendors = await searchVendors('biometric', { prime_only: true });
const contracts = await getLiveContracts('Palantir Technologies');
```

### cURL
```bash
# Search vendors
curl "http://localhost:8000/vendors?q=drone&limit=10"

# Get live contracts
curl "http://localhost:8000/live/contracts/Anduril"

# Compare vendors
curl "http://localhost:8000/live/compare?vendors=Palantir,Clearview%20AI"

# Get enriched profile
curl "http://localhost:8000/enriched/TECH002"
```

## Development

### Project Structure
```
procurement_api/
├── main.py              # FastAPI application
├── gov_queries.py       # Government database queries
├── requirements.txt     # Dependencies
└── README.md           # This file
```

### Adding New Features

**Add a new endpoint:**
```python
@app.get("/my-endpoint")
async def my_endpoint(param: str):
    # Your logic here
    return {"result": "data"}
```

**Add a new government data source:**
```python
# In gov_queries.py
def query_new_source(self, search_term):
    # Implement new source
    return results
```

## Use Cases for Journalists

### 1. Follow the Money
Track how much specific vendors receive from DHS and what programs they're involved in.

### 2. Map Corporate Relationships
Understand parent companies, subsidiaries, and strategic partnerships in the surveillance-industrial complex.

### 3. Technology Tracking
Monitor which technologies (facial recognition, drones, AI) are being procured and by which agencies.

### 4. Timeline Analysis
Use contract history to build timelines of vendor relationships with government agencies.

### 5. Industry Influence
Track industry day participation to see which companies have inside access to procurement officers.

## Contributing

This API is built for investigative journalists and researchers. Suggestions for new features or data sources are welcome.

## License

This API aggregates public data from the EFF and U.S. government sources. Respect the original data licenses.

## Credits

- **Dataset**: Electronic Frontier Foundation & Heinrich Boell Foundation
- **Methodology Guide**: https://www.eff.org/deeplinks/2026/01/homeland-security-spending-trail
- **Government Data**: USASpending.gov, FPDS.gov, SAM.gov

## Support

For questions about the EFF dataset, visit: https://www.eff.org/

For questions about government procurement databases, consult the EFF's guide included with this API.
