# GoHighLevel Integration Guide

## Add Analytics Dashboard to GHL

The dashboard is deployed and ready. Follow these steps to add it as a custom menu link in GoHighLevel.

---

### Step 1: Access Custom Menu Links

1. Log into GoHighLevel as **Agency Owner**
2. Click **Settings** (gear icon) in the left sidebar
3. Scroll down and click **Custom Menu Links**

---

### Step 2: Add New Menu Link

Click **"Add New Link"** and fill in:

| Field | Value |
|-------|-------|
| **Name** | Analytics Dashboard |
| **URL** | `https://unified-analytics-dashboard-633ajzd53-marios-projects-8c0d1128.vercel.app` |
| **Icon** | Choose any (suggestion: chart-bar or dashboard icon) |
| **Open in** | Same window (default) |

---

### Step 3: Save

Click **Save** to add the menu link.

---

### Step 4: Verify

1. Refresh the GHL page
2. Look for "Analytics Dashboard" in the left sidebar
3. Click it - the dashboard should load in an iframe

---

## Troubleshooting

**Dashboard not loading?**
- Check if the URL is correct (no extra spaces)
- Try opening the URL directly in a browser first

**Menu link not appearing?**
- Refresh the page
- Clear browser cache
- Check if link is enabled/active

---

## Notes

- The dashboard currently displays **mock data** for UI preview
- Auto-updates when code is pushed to GitHub
- No authentication required (public URL)

---

## Support

Questions? Contact the development team.
