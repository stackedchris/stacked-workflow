# 🗃️ Airtable Integration Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Airtable Account & Base

1. Go to [airtable.com](https://airtable.com) and create an account
2. Click **"Create a base"** → **"Start from scratch"**
3. Name your base: `Stacked Creator Pipeline`

### Step 2: Get API Credentials

1. Go to [Airtable Developer Hub](https://airtable.com/create/tokens)
2. Click **"Create token"**
3. Name: `Stacked Integration`
4. Add scopes: `data.records:read`, `data.records:write`
5. Add your base to the token
6. Copy the API key (starts with `pat...`)

### Step 3: Set Up Base Structure

**Option A: Import CSV (Easiest)**
1. Go to Stacked Platform → **Airtable** tab → **Export/Import**
2. Click **"Export Creators to CSV"**
3. In Airtable: Base menu → **"Import data"** → **"CSV file"**
4. Upload the CSV and let Airtable auto-map fields

**Option B: Manual Setup**
1. Use the template structure below to create fields manually
2. Copy the field setup from the Template tab in the platform

### Step 4: Connect Platform

1. In Airtable, copy your **Base ID** from the URL (starts with `app...`)
2. Go to Stacked Platform → **Airtable** tab → **Setup**
3. Enter API key, Base ID, and table name ("Table 1" or "Creators")
4. Click **"Connect to Airtable"**
5. Test with **"Sync Creators"**

---

## 📊 Base Structure

### Table: Creators

#### Basic Information Fields:
```
Name (Single line text) - Primary field
Email (Email)
Phone (Phone number)
Category (Single select): Gaming, Music, Streaming, Lifestyle, Comedy, Fashion
Avatar (Single line text)
Bio (Long text)
```

#### Pipeline Fields:
```
Phase (Single select):
  - Phase 0: Strategy Call
  - Phase 1: Drop Prep
  - Phase 2: Launch Week
  - Phase 3: Sell-Out Push
  - Phase 4: Post-Sellout

Phase Number (Number)
Days in Phase (Number)
Next Task (Single line text)
```

#### Performance Fields:
```
Cards Sold (Number)
Total Cards (Number) - Default: 100
Card Price (Currency)
Sales Velocity (Single select): High, Medium, Low, Pending
Revenue (Formula): {Cards Sold} * {Card Price}
Progress Percentage (Formula): ROUND(({Cards Sold} / {Total Cards}) * 100, 0)
```

#### Social Media Fields:
```
Instagram (URL)
Twitter (URL)
YouTube (URL)
TikTok (URL)
```

#### Strategy Fields:
```
Launch Date (Date)
Target Audience (Long text)
Content Plan (Long text)
```

#### Metadata Fields:
```
Created Date (Date)
Last Updated (Date)
```

---

## 📈 Recommended Views

### 1. **Pipeline Dashboard**
- **Group by:** Phase
- **Sort:** Days in Phase (descending)
- **Fields:** Name, Category, Cards Sold, Sales Velocity, Next Task
- **Use:** Main workflow view for daily management

### 2. **High Priority**
- **Filter:** Sales Velocity = "Low" OR Days in Phase > 7
- **Sort:** Days in Phase (descending)
- **Fields:** Name, Phase, Days in Phase, Sales Velocity, Next Task
- **Use:** Focus on creators needing immediate attention

### 3. **Revenue Tracking**
- **Group by:** Category
- **Sort:** Revenue (descending)
- **Fields:** Name, Cards Sold, Card Price, Revenue, Progress Percentage
- **Use:** Financial performance analysis

### 4. **Launch Calendar**
- **View type:** Calendar
- **Date field:** Launch Date
- **Fields:** Name, Phase, Target Audience
- **Use:** Timeline planning and scheduling

### 5. **Social Media Hub**
- **Filter:** Instagram, Twitter, YouTube, or TikTok is not empty
- **Fields:** Name, Instagram, Twitter, YouTube, TikTok, Category
- **Use:** Social media outreach and monitoring

---

## 🔄 Integration Methods

### **Method 1: Real-time API Sync (Recommended)**
- **Pros:** Instant updates, two-way sync, automated workflow
- **Setup:** Configure API credentials in platform
- **Best for:** Active daily use, team collaboration

### **Method 2: CSV Export/Import**
- **Pros:** Simple, no API setup required, one-time migration
- **Setup:** Export CSV from platform, import to Airtable
- **Best for:** Initial setup, periodic backups

### **Method 3: Manual Entry**
- **Pros:** Full control, no technical setup
- **Setup:** Use Airtable template structure
- **Best for:** Small teams, preference for manual workflow

---

## ⚡ Automation Ideas

### **Airtable Automations:**

#### **1. Phase Progression Alert**
- **Trigger:** When "Days in Phase" > 7
- **Action:** Send Slack/email notification to team

#### **2. Revenue Milestone**
- **Trigger:** When "Revenue" reaches $5,000
- **Action:** Create celebration task, notify team

#### **3. Low Velocity Warning**
- **Trigger:** When "Sales Velocity" = "Low"
- **Action:** Assign urgent follow-up task

### **Zapier/Make.com Integrations:**

#### **1. Slack Notifications**
- **Trigger:** New creator added to base
- **Action:** Post in #creator-pipeline channel

#### **2. Email Sequences**
- **Trigger:** Creator moves to Phase 3
- **Action:** Send urgency email campaign

#### **3. Calendar Events**
- **Trigger:** Launch Date is 3 days away
- **Action:** Create Google Calendar reminder

---

## 🎨 Advanced Features

### **Formula Fields:**

#### **Days Until Launch**
```
IF({Launch Date}, DATETIME_DIFF({Launch Date}, TODAY(), 'days'), BLANK())
```

#### **Revenue Goal Progress**
```
IF({Card Price}, ROUND(({Cards Sold} * {Card Price}) / 10000 * 100, 1) & "% to $10K", BLANK())
```

#### **Phase Duration**
```
IF({Phase} = "Phase 2: Launch Week",
   IF({Days in Phase} > 7, "⚠️ Extended", "✅ On Track"),
   IF({Days in Phase} > 14, "🚨 Overdue", "📅 Normal"))
```

### **Conditional Formatting:**
- **Red:** Sales Velocity = "Low" OR Days in Phase > 7
- **Yellow:** Cards Sold < 50 AND Phase = "Phase 2"
- **Green:** Cards Sold = 100 (Sold out)

### **Linked Records:**
- **Tasks Table:** Link to creators for detailed task management
- **Campaigns Table:** Track marketing campaigns per creator
- **Revenue Table:** Detailed financial tracking and payouts

---

## 🔧 Troubleshooting

### **Common Issues:**

#### **"Permission Denied" Error**
- ✅ Check API token has correct scopes
- ✅ Verify base is shared with the token
- ✅ Ensure table name matches exactly

#### **"Field Not Found" Error**
- ✅ Check field names match template exactly
- ✅ Verify field types are correct (Text, Number, etc.)
- ✅ Make sure all required fields exist

#### **Sync Incomplete**
- ✅ Check Airtable rate limits (5 requests/second)
- ✅ Verify all creators have required fields
- ✅ Review error logs in browser console

### **Performance Tips:**
- **Batch Updates:** Use API sync for bulk changes
- **View Filters:** Limit record counts in views for faster loading
- **Field Cleanup:** Remove unused fields to reduce complexity

---

## 📱 Mobile Usage

### **Airtable Mobile App:**
- ✅ Full access to all views and data
- ✅ Real-time sync with platform updates
- ✅ Offline viewing (with sync when connected)
- ✅ Quick data entry and photo uploads

### **Mobile-Optimized Views:**
- **Creator Quick View:** Name, Phase, Cards Sold, Next Task
- **Contact Info:** Name, Email, Phone, Social Media
- **Revenue Summary:** Name, Revenue, Progress Percentage

---

## 🚀 Getting Started Checklist

- [ ] Create Airtable account and base
- [ ] Get API token from Developer Hub
- [ ] Set up base structure (use CSV import or manual)
- [ ] Connect platform to Airtable
- [ ] Test sync with sample data
- [ ] Create recommended views
- [ ] Set up automations (optional)
- [ ] Train team on Airtable usage
- [ ] Configure mobile access
- [ ] Schedule regular sync/backup

**Estimated setup time:** 15-30 minutes
**Team training time:** 30 minutes
**ROI:** Immediate workflow improvement and data visibility

Your Stacked workflow is now fully integrated with Airtable for powerful database management and team collaboration!
