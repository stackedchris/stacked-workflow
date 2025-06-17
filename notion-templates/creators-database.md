# Stacked Creators Database Template

## Database Properties

### Basic Information
- **Name** (Title) - Creator's full name
- **Avatar** (Text) - Emoji or image URL for avatar
- **Category** (Select) - Gaming, Music, Streaming, Lifestyle, Comedy, Fashion
- **Bio** (Text) - Creator description and background

### Contact Information
- **Email** (Email) - Primary contact email
- **Phone** (Phone) - Contact phone number
- **Instagram** (URL) - Instagram profile URL
- **Twitter** (URL) - Twitter profile URL
- **YouTube** (URL) - YouTube channel URL
- **TikTok** (URL) - TikTok profile URL

### Pipeline Status
- **Phase** (Select) - Phase 0: Strategy Call, Phase 1: Drop Prep, Phase 2: Launch Week, Phase 3: Sell-Out Push, Phase 4: Post-Sellout
- **Days in Phase** (Number) - Number of days in current phase
- **Next Task** (Text) - Current action item for creator
- **Sales Velocity** (Select) - Pending, Low, Medium, High, Very High

### Performance Metrics
- **Cards Sold** (Number) - Number of cards sold (0-100)
- **Total Cards** (Number) - Total cards available (default: 100)
- **Card Price** (Number) - Price per card in USD
- **Revenue** (Formula) - Cards Sold × Card Price
- **Sell Rate** (Formula) - (Cards Sold / Total Cards) × 100

### Strategy & Planning
- **Launch Date** (Date) - Planned or actual launch date
- **Target Audience** (Text) - Primary audience description
- **Content Plan** (Text) - Content strategy and plan
- **Pricing Structure** (Text) - Pricing strategy details

### Assets & Files
- **Profile Images** (Files) - Profile photos and promotional images
- **Videos** (Files) - Intro videos, highlights, content
- **Press Kit** (Files) - Media kit, bio, statistics

### Timeline
- **Created** (Created time) - When creator was added
- **Last Updated** (Last edited time) - Last modification date
- **Status** (Select) - Active, Inactive, Completed, On Hold

## Database Views

### 1. Pipeline Overview (Board View)
- **Group by**: Phase
- **Sort by**: Days in Phase (ascending)
- **Properties**: Name, Avatar, Category, Cards Sold, Next Task

### 2. Performance Dashboard (Table View)
- **Filter**: Status = Active
- **Sort by**: Revenue (descending)
- **Properties**: Name, Category, Cards Sold, Revenue, Sell Rate, Sales Velocity

### 3. Launch Calendar (Calendar View)
- **Date property**: Launch Date
- **Properties**: Name, Category, Phase, Card Price

### 4. Active Creators (Table View)
- **Filter**: Phase ≠ "Phase 4: Post-Sellout" AND Status = Active
- **Sort by**: Phase, Days in Phase
- **Properties**: Name, Category, Phase, Days in Phase, Next Task, Sales Velocity

### 5. Category Breakdown (Board View)
- **Group by**: Category
- **Sort by**: Revenue (descending)
- **Properties**: Name, Phase, Cards Sold, Revenue

## Database Templates

### New Creator Template
```
Name: [Creator Name]
Category: [Select Category]
Phase: Phase 0: Strategy Call
Days in Phase: 0
Next Task: Schedule strategy call
Sales Velocity: Pending
Cards Sold: 0
Total Cards: 100
Card Price: 100
Status: Active
```

### Strategy Call Complete Template
```
Phase: Phase 1: Drop Prep
Days in Phase: 0
Next Task: Record teaser video
Launch Date: [Set Date]
Target Audience: [Fill in]
Content Plan: [Fill in]
Pricing Structure: [Fill in]
```

## Formulas

### Revenue Formula
```
prop("Cards Sold") * prop("Card Price")
```

### Sell Rate Formula
```
round((prop("Cards Sold") / prop("Total Cards")) * 100)
```

### Days Since Launch Formula (for completed drops)
```
dateBetween(now(), prop("Launch Date"), "days")
```

## Automation Rules (if using Notion AI)

1. **Phase Progression**: When "Cards Sold" reaches 100, automatically change Phase to "Phase 4: Post-Sellout"
2. **Stale Alert**: When "Days in Phase" > 14, add "🚨" to Next Task
3. **Revenue Tracking**: Update revenue automatically when Cards Sold or Card Price changes

## Integration Setup

### API Properties for Sync
- All properties should be accessible via Notion API
- Use consistent naming for automated sync
- Enable integration access to database

### Webhook Setup (Optional)
- Set up webhooks for real-time sync when data changes in Notion
- Configure bidirectional sync between Stacked platform and Notion

## Usage Instructions

1. **Duplicate this template** to your Notion workspace
2. **Customize categories** based on your creator types
3. **Set up integration** using Notion API token
4. **Configure database ID** in Stacked platform
5. **Run initial sync** to populate with existing creators
6. **Use views** to manage different aspects of creator pipeline

This database template provides a comprehensive foundation for managing your creator pipeline in Notion while maintaining sync with the Stacked workflow platform.
