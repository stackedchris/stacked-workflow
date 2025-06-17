# 📋 Stacked Creators - Notion Template

## Quick Setup (30 seconds)

### Step 1: Duplicate This Template
**Copy this template:** [Duplicate Stacked Creators Database](https://www.notion.so/templates)

### Step 2: Use With Your Data
Once duplicated, you can:
- **Manual Entry**: Add creators directly in Notion
- **CSV Import**: Export from Stacked → Import to Notion
- **API Sync**: Set up integration for real-time sync

---

## 🗃️ Template Structure

### Database Properties:
```
Name (Title)
Category (Select): Gaming, Music, Streaming, Lifestyle, Comedy, Fashion
Phase (Select): Phase 0-4 with full names
Cards Sold (Number)
Total Cards (Number): Default 100
Card Price (Number): Formatted as currency
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
Progress (Formula): Cards Sold / Total Cards * 100
Revenue (Formula): Cards Sold * Card Price
```

### Pre-built Views:
- **📊 Dashboard**: Overview of all creators
- **🔥 Active Pipeline**: Creators in phases 1-3
- **⚡ High Priority**: Low velocity or >7 days in phase
- **💰 Revenue**: Sorted by earnings
- **📅 Launch Calendar**: Upcoming launches
- **🎯 By Category**: Grouped by creator type

### Sample Data Included:
```
Kurama | Gaming | Phase 2: Launch Week | 67/100 cards | $6,700
Nina Lin | Streaming | Phase 1: Drop Prep | 0/100 cards | $0
Edward So | Music | Phase 3: Sell-Out Push | 85/100 cards | $5,950
```

---

## 📊 Quick Start Templates

### Option A: Copy & Paste Template
```
Just copy this structure and paste into a new Notion database:

Name: [Text]
Category: Gaming, Music, Streaming, Lifestyle, Comedy, Fashion
Phase: Phase 0: Strategy Call, Phase 1: Drop Prep, Phase 2: Launch Week, Phase 3: Sell-Out Push, Phase 4: Post-Sellout
Cards Sold: [Number]
Card Price: [Number - Currency format]
Email: [Email]
Phone: [Phone]
Instagram: [URL]
Twitter: [URL]
Bio: [Text]
Sales Velocity: High, Medium, Low, Pending
Next Task: [Text]
Launch Date: [Date]
```

### Option B: Import This CSV
```csv
Name,Category,Phase,Cards Sold,Total Cards,Card Price,Email,Phone,Instagram,Twitter,Bio,Sales Velocity,Next Task,Launch Date
Kurama,Gaming,Phase 2: Launch Week,67,100,100,kurama@example.com,+1 (555) 123-4567,https://instagram.com/kurama_smash,https://twitter.com/KuramaPlays,Top Smash Bros player,High,Post group chat screenshot,2025-06-20
Nina Lin,Streaming,Phase 1: Drop Prep,0,100,75,nina@example.com,+1 (555) 234-5678,https://instagram.com/ninalin,https://twitter.com/NinaStreams,Popular streamer and co-founder,Pending,Record teaser video,2025-06-25
Edward So,Music,Phase 3: Sell-Out Push,85,100,70,edward@example.com,+1 (555) 345-6789,https://instagram.com/edwardso,https://twitter.com/EdwardSoMusic,DJ and creative entrepreneur,Medium,Post only 15 left story,2025-06-18
```

---

## 🎯 Pro Views to Create

### 1. Active Pipeline View
**Filter:** Phase ≠ "Phase 4: Post-Sellout"
**Sort:** Days in Phase (Descending)
**Show:** Name, Phase, Cards Sold, Next Task

### 2. Revenue Dashboard
**Group by:** Category
**Sort:** Revenue (Descending)
**Show:** Name, Cards Sold, Card Price, Revenue

### 3. Launch Calendar
**Layout:** Calendar
**Date property:** Launch Date
**Show:** All upcoming launches

### 4. Urgent Attention
**Filter:** Sales Velocity = "Low" OR Days in Phase > 7
**Sort:** Days in Phase (Descending)

---

## 🚀 Getting Started

1. **Choose your method:**
   - **Fastest**: Use CSV export/import
   - **Most flexible**: Duplicate template
   - **Most powerful**: Set up API integration

2. **Start with sample data** to test views and formulas

3. **Customize views** for your team's workflow

4. **Add automations** (Notion's built-in or Zapier)

This gives you a fully functional Stacked workflow in Notion without any API complexity!
