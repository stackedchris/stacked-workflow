# 🚀 Notion Integration Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Name: `Stacked Workflow`
4. Workspace: Select your workspace
5. Click **"Submit"**
6. Copy the **"Integration Token"** (starts with `secret_`)

### Step 2: Create Database in Notion

**Option A: Quick Setup (Recommended)**
1. Go to Stacked Platform → **Notion Sync** tab → **Templates**
2. Click **"Duplicate Template"** for Creators Database
3. This creates a pre-configured database with all fields

**Option B: Manual Setup**
1. In Notion, create a new page called "Stacked Creators"
2. Add a database with these properties:

```
Name (Title)
Category (Select): Gaming, Music, Streaming, Lifestyle, Comedy, Fashion
Phase (Select): Phase 0, Phase 1, Phase 2, Phase 3, Phase 4
Cards Sold (Number)
Total Cards (Number)
Card Price (Number)
Email (Email)
Phone (Phone)
Instagram (URL)
Twitter (URL)
YouTube (URL)
Bio (Text)
Avatar (Text)
Sales Velocity (Select): High, Medium, Low, Pending
Days in Phase (Number)
Next Task (Text)
Launch Date (Date)
Target Audience (Text)
Content Plan (Text)
```

### Step 3: Share Database with Integration

1. Open your database in Notion
2. Click **"Share"** (top right)
3. Click **"Invite"**
4. Select **"Stacked Workflow"** (your integration)
5. Set permissions to **"Can edit"**

### Step 4: Get Database ID

1. Open database in Notion
2. Copy URL (example: `notion.so/workspace/abc123def456...`)
3. Extract the 32-character database ID from URL

### Step 5: Connect in Stacked Platform

1. Go to **Stacked Platform** → **Notion Sync** tab
2. Enter your **Integration Token**
3. Enter **Database ID**
4. Click **"Connect to Notion"**
5. Test with **"Sync Creators"**

---

## 🔄 How Sync Works

### Real-time Sync Features:
- ✅ **Create New**: Adds new creators to Notion
- ✅ **Update Existing**: Updates creator progress and status
- ✅ **Field Mapping**: Automatically maps all creator fields
- ✅ **Error Handling**: Detailed error messages for troubleshooting

### What Gets Synced:
- **Creator Info**: Name, email, phone, bio
- **Pipeline Data**: Phase, cards sold, next tasks
- **Social Media**: Instagram, Twitter, YouTube links
- **Strategy**: Launch dates, target audience, content plans
- **Performance**: Sales velocity, days in phase

---

## 🛠 API Endpoints Available

### Test Connection
```bash
POST /api/notion/test-connection
{
  "token": "secret_...",
  "creatorsDatabaseId": "abc123..."
}
```

### Sync Creators
```bash
POST /api/notion/sync-creators
{
  "token": "secret_...",
  "creatorsDatabaseId": "abc123...",
  "creators": [...]
}
```

### Get Creators from Notion
```bash
GET /api/notion/sync-creators?token=secret_...&creatorsDatabaseId=abc123...
```

### Create Database
```bash
POST /api/notion/create-database
{
  "token": "secret_...",
  "parentPageId": "page123..."
}
```

---

## 🎯 Pro Tips

### Notion Views for Your Team:

**1. Active Pipeline View**
- Filter: `Phase` not equal to `Phase 4: Post-Sellout`
- Sort: `Days in Phase` descending
- Shows creators who need attention

**2. High Priority View**
- Filter: `Sales Velocity` equals `Low` OR `Days in Phase` > 7
- Highlights creators needing urgent action

**3. Revenue Dashboard**
- Group by: `Category`
- Formula: `Cards Sold * Card Price`
- Shows revenue by creator type

### Automation Ideas:

**1. Slack Notifications**
- When creator moves to new phase → Post in #team-updates
- When sales velocity = "Low" → Alert in #urgent-creators

**2. Email Reminders**
- When `Days in Phase` > 7 → Send team reminder
- When `Launch Date` approaching → Notify creator

**3. Task Creation**
- When `Phase` changes → Auto-create phase-specific tasks
- When `Cards Sold` stalls → Create urgency tasks

---

## 🔧 Troubleshooting

### Common Issues:

**"Connection Failed"**
- ✅ Check integration token is correct
- ✅ Verify token starts with `secret_`
- ✅ Ensure integration has access to workspace

**"Database Not Found"**
- ✅ Verify database ID is 32 characters (no dashes)
- ✅ Check database is shared with integration
- ✅ Ensure integration has "Can edit" permissions

**"Sync Failed"**
- ✅ Check required fields are not empty
- ✅ Verify select options match (e.g., "Gaming" not "gaming")
- ✅ Review error message for specific field issues

**"Permission Denied"**
- ✅ Re-share database with integration
- ✅ Check integration is added to correct workspace
- ✅ Verify database permissions are "Can edit"

### Need More Help?

1. **Check Connection**: Use "Test Connection" in Notion Sync tab
2. **View Logs**: Check browser console for detailed errors
3. **Verify Setup**: Follow this guide step-by-step
4. **Contact Support**: Include error messages and setup details

---

## 📊 Sample Database Structure

### Example Creator Entry:
```
Name: Kurama
Category: Gaming
Phase: Phase 2: Launch Week
Cards Sold: 67
Card Price: $100
Email: kurama@example.com
Instagram: https://instagram.com/kurama_smash
Sales Velocity: High
Next Task: Post group chat screenshot
Launch Date: 2025-06-20
Target Audience: Competitive gaming fans, Smash community
```

### Views You Can Create:
- **By Phase**: Group creators by current phase
- **By Category**: See performance by creator type
- **By Sales Velocity**: Focus on creators needing help
- **Revenue Tracking**: Calculate total earnings
- **Launch Calendar**: Upcoming launches by date

This integration gives you the best of both worlds: the powerful workflow automation of Stacked with the flexible organization of Notion!
