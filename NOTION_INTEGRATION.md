# Stacked → Notion Integration Guide

## 🎯 Overview

This guide shows you how to sync your Stacked creator workflow data with Notion databases. You have several options depending on your needs:

## 📋 Integration Methods

### **1. Direct API Integration (Recommended)**
Real-time sync between Stacked platform and Notion databases.

### **2. CSV Export/Import**
Manual data transfer for one-time migrations or periodic updates.

### **3. Notion Templates**
Pre-built database structures that match your Stacked workflow.

---

## 🔌 Method 1: Direct API Integration

### **Step 1: Create Notion Integration**

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it "Stacked Workflow"
4. Select your workspace
5. Copy the "Integration Token" (starts with `secret_`)

### **Step 2: Create Notion Databases**

#### **Creators Database**
```
Database Name: Stacked Creators
Properties:
- Name (Title)
- Category (Select: Gaming, Music, Streaming, Lifestyle, Comedy, Fashion)
- Phase (Select: Phase 0, Phase 1, Phase 2, Phase 3, Phase 4)
- Cards Sold (Number)
- Total Cards (Number: Default 100)
- Card Price (Number)
- Email (Email)
- Phone (Phone)
- Instagram (URL)
- Twitter (URL)
- YouTube (URL)
- Bio (Text)
- Avatar (Text)
- Sales Velocity (Select: High, Medium, Low, Pending)
- Days in Phase (Number)
- Next Task (Text)
- Launch Date (Date)
- Target Audience (Text)
- Content Plan (Text)
- Created Date (Created time)
- Last Updated (Last edited time)
```

#### **Tasks Database** (Optional)
```
Database Name: Stacked Tasks
Properties:
- Task Name (Title)
- Creator (Relation to Creators Database)
- Phase (Select: Phase 0, Phase 1, Phase 2, Phase 3, Phase 4)
- Priority (Select: High, Medium, Low)
- Status (Select: Pending, In Progress, Completed)
- Assigned To (Select: Creator, Team)
- Due Date (Date)
- Automation Rule (Text)
- Created Date (Created time)
```

#### **Templates Database** (Optional)
```
Database Name: Content Templates
Properties:
- Template Name (Title)
- Platform (Select: Instagram, Twitter, TikTok, Instagram Story)
- Phase (Select: Phase 0, Phase 1, Phase 2, Phase 3, Phase 4)
- Category (Select: Announcement, Social Proof, Urgency, Utility, Teaser, Education)
- Content (Text)
- Success Rate (Number)
- Engagement Level (Select: Very High, High, Medium, Low)
- Uses Count (Number)
- Tags (Multi-select)
- Last Used (Date)
```

### **Step 3: Share Databases with Integration**

1. Open each database in Notion
2. Click "Share" (top right)
3. Click "Invite"
4. Select your "Stacked Workflow" integration
5. Give it "Edit" permissions

### **Step 4: Get Database IDs**

1. Open database in Notion
2. Copy URL (looks like: `notion.so/workspace/DATABASE_ID?v=...`)
3. Extract the DATABASE_ID (32-character string)

### **Step 5: Connect in Stacked Platform**

1. Go to Stacked Platform → Notion Sync tab
2. Enter your Integration Token
3. Enter Database IDs
4. Click "Connect to Notion"
5. Test sync with sample data

---

## 📊 Method 2: CSV Export/Import

### **From Stacked to Notion:**

1. **Export Data**: Stacked Platform → Notion Sync → Export/Import → "Export Creators to CSV"

2. **Import to Notion**:
   - Create a new database or open existing one
   - Click "..." menu → "Import"
   - Select your CSV file
   - Map columns to database properties

### **From Notion to Stacked:**

1. **Export from Notion**:
   - Open your database
   - Click "..." menu → "Export"
   - Select "CSV" format

2. **Import to Stacked**:
   - Stacked Platform → Notion Sync → Export/Import
   - Upload CSV file
   - Map fields and import

---

## 📋 Method 3: Notion Templates

### **Pre-built Templates:**

#### **🎮 Creator Database Template**
```
Copy this template: [Duplicate Template Link]

Includes:
- All creator fields pre-configured
- Views: By Phase, By Category, By Sales Velocity
- Formulas: Progress %, Revenue calculations
- Filters: Active creators, Pending tasks
```

#### **📋 Task Management Template**
```
Copy this template: [Duplicate Template Link]

Includes:
- Task tracking with relations to creators
- Kanban view by status
- Calendar view by due dates
- Automation triggers and rules
```

#### **📝 Content Templates Database**
```
Copy this template: [Duplicate Template Link]

Includes:
- Template library with performance tracking
- Views: By platform, By success rate
- Tags and categories for easy filtering
- Usage statistics and optimization
```

---

## 🔧 Advanced Configuration

### **Custom Views in Notion:**

#### **Creator Pipeline View**
```
Filter: Phase = "Phase 2: Launch Week"
Sort: Days in Phase (Descending)
Properties: Name, Cards Sold, Next Task, Sales Velocity
```

#### **High Priority Tasks**
```
Filter: Priority = "High" AND Status = "Pending"
Sort: Due Date (Ascending)
Properties: Task Name, Creator, Due Date, Phase
```

#### **Performance Dashboard**
```
Group: Category
Sort: Cards Sold (Descending)
Properties: Name, Cards Sold, Card Price, Revenue (Formula)
```

### **Notion Formulas:**

#### **Revenue Calculation**
```
prop("Cards Sold") * prop("Card Price")
```

#### **Progress Percentage**
```
round(prop("Cards Sold") / prop("Total Cards") * 100)
```

#### **Days Until Launch**
```
dateBetween(prop("Launch Date"), now(), "days")
```

---

## 🚀 Automation Ideas

### **Notion Automations:**

1. **Phase Progression Alert**:
   - When "Days in Phase" > 7 → Send notification

2. **Low Sales Velocity Warning**:
   - When "Sales Velocity" = "Low" → Create urgent task

3. **Launch Reminder**:
   - When "Launch Date" is 3 days away → Notify team

### **Zapier/Make.com Integrations:**

1. **Slack Notifications**:
   - New creator added → Post in #team-updates
   - Phase change → Post in #creator-pipeline

2. **Email Automations**:
   - Creator moves to Phase 3 → Send urgency email template
   - Sellout completed → Send congratulations email

---

## 📞 Support & Troubleshooting

### **Common Issues:**

**Connection Failed:**
- Check integration token is correct
- Verify database is shared with integration
- Ensure database IDs are 32 characters

**Sync Errors:**
- Check property types match expected format
- Verify required fields are not empty
- Review Notion API rate limits

**Missing Data:**
- Check field mapping between systems
- Verify permissions on Notion databases
- Review sync logs for error messages

### **Need Help?**
- Check the Notion Sync tab for connection status
- Use the Export/Import feature as a backup method
- Contact support with specific error messages

---

## 📊 Sample Data Structure

### **Creators CSV Format:**
```csv
Name,Category,Phase,Cards Sold,Email,Phone,Instagram,Twitter,Card Price
Kurama,Gaming,Phase 2: Launch Week,67,kurama@example.com,+1 (555) 123-4567,@kurama_smash,@KuramaPlays,100
Nina Lin,Streaming,Phase 1: Drop Prep,0,nina@example.com,+1 (555) 234-5678,@ninalin,@NinaStreams,75
```

### **Tasks CSV Format:**
```csv
Task Name,Creator,Phase,Priority,Status,Due Date
Post group chat screenshot,Kurama,Phase 2: Launch Week,High,Pending,2025-06-16
Record teaser video,Nina Lin,Phase 1: Drop Prep,Medium,In Progress,2025-06-18
```

This integration gives you the flexibility to work with both systems while maintaining data consistency and automating your creator pipeline management!
