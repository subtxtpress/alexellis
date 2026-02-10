# Connect Your Dashboard to Supabase

## Step 1: Add Supabase Library

Open `foia-dashboard.html` and add this line BEFORE the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="dashboard-supabase.js"></script>
</body>
</html>
```

## Step 2: Update dashboard-supabase.js

Open `dashboard-supabase.js` and replace these lines (at the top):

```javascript
const SUPABASE_URL = 'https://raqonwahukpejuftbqav.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcW9ud2FodWtwZWp1ZnRicWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDM1MjcsImV4cCI6MjA4NjE3OTUyN30.p7ZEoIXrR6H95H6phQBp3XU-pzOptDSVZe6ZSv7lelM'
```

## Step 3: Add Data Attributes to Your HTML

The JavaScript looks for specific elements. Make sure your dashboard HTML has these:

### Dashboard Metrics:
```html
<div class="metric-value" data-metric="total">0</div>
<div class="metric-value" data-metric="active">0</div>
<div class="metric-value" data-metric="avg-days">0</div>
```

### Status Breakdown:
```html
<div class="stat-value" data-status="Filed">0</div>
<div class="stat-value" data-status="Acknowledged">0</div>
<div class="stat-value" data-status="Processing">0</div>
<div class="stat-value" data-status="Denied">0</div>
<div class="stat-value" data-status="Appeal Filed">0</div>
<div class="stat-value" data-status="Closed - Complete">0</div>
```

### Active Requests Container:
```html
<div id="requests" class="page">
    <div class="requests-list">
        <!-- Request cards will be inserted here by JavaScript -->
    </div>
</div>
```

### Timeline Containers:
```html
<div id="timeline" class="page">
    <section data-urgency="OVERDUE">
        <!-- Overdue deadlines inserted here -->
    </section>
    <section data-urgency="URGENT">
        <!-- Urgent deadlines inserted here -->
    </section>
    <section data-urgency="SOON">
        <!-- Soon deadlines inserted here -->
    </section>
    <section data-urgency="MONITOR">
        <!-- Monitor deadlines inserted here -->
    </section>
</div>
```

## Step 4: Test It

1. Open `foia-dashboard.html` in your browser
2. Open Developer Console (F12)
3. You should see: "🚀 FOIA Dashboard initializing..."
4. Then: "✅ Dashboard loaded with X requests"
5. Your dashboard should now show the request you added!

## What This Does:

✅ Loads all requests from Supabase on page load
✅ Updates dashboard metrics automatically
✅ Populates Active Requests page with real data
✅ Updates Timeline with actual deadlines
✅ Refreshes data every 5 minutes
✅ Creates request cards dynamically

## Troubleshooting:

**"Failed to load dashboard data"**
- Check your Supabase URL and API key
- Make sure RLS is still disabled
- Open Console to see the exact error

**Dashboard shows "0 requests"**
- Check that you have data in Supabase Table Editor
- Make sure the JavaScript file is loaded (check Network tab in DevTools)

**Request cards don't appear**
- Make sure the `.requests-list` container exists in your HTML
- Check Console for JavaScript errors
