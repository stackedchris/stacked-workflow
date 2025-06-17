# Stacked Workflow Platform

A comprehensive creator pipeline management and automation platform built with Next.js, featuring real-time analytics, database integrations, and strategic launch frameworks.

## 🚀 Features

### Core Platform
- **Creator Pipeline Management** - Complete lifecycle tracking through 5 phases
- **Content Management** - Upload, schedule, assign, and track visual content
- **Real-time Analytics** - Performance metrics and insights dashboard
- **Strategy Guide** - Comprehensive Top 100 launch strategy framework

### Database Integrations
- **Airtable Integration** - Real-time sync with complete setup package
- **Notion Integration** - Professional database templates and sync
- **Local Storage** - Persistent data across browser sessions

### Advanced Features
- **Asset Management** - Upload and organize profile images, videos, press kits
- **Social Media Intelligence** - Profile analytics and content scraping
- **Phase Management** - Customizable workflows with task tracking
- **Export/Import** - CSV exports ready for database import

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Database**: Airtable API, Notion API
- **Storage**: localStorage with custom hooks
- **Deployment**: Netlify-ready configuration

## 📊 Project Status

**Current Version**: v23 - Final Cleanup Phase
- ✅ 25+ major features implemented
- ✅ 15+ React components
- ✅ 8+ API endpoints
- ✅ Comprehensive documentation
- ✅ Production-ready integrations

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Analytics.tsx     # Analytics dashboard
│   ├── CreatorManagement.tsx
│   ├── ContentManager.tsx
│   ├── AirtableIntegration.tsx
│   ├── StrategyGuide.tsx
│   └── ...
├── lib/                  # Utilities and services
│   ├── airtable.ts      # Airtable integration
│   ├── notion.ts        # Notion integration
│   └── utils.ts
└── hooks/               # Custom React hooks
    └── useLocalStorage.ts
```

## 🔧 Configuration

### Environment Variables
The platform works out of the box with demo data. For live integrations:

- **Airtable**: Configure API key and base ID in the Airtable tab
- **Notion**: Set up integration token and database IDs in Notion sync

### Database Setup
Complete setup packages are included for both Airtable and Notion:
- Pre-configured field structures
- CSV export/import ready
- One-click template duplication
- Step-by-step setup guides

## 📈 Key Metrics

- **Total Revenue Tracking**: Real-time calculation across all creators
- **Pipeline Analytics**: Phase distribution and progression tracking
- **Performance Insights**: Success rates, engagement metrics, velocity tracking
- **Content Analytics**: Upload, scheduling, and posting statistics

## 🎯 Use Cases

### For Creator Management Teams
- Track multiple creators through launch phases
- Monitor sales velocity and revenue
- Manage content calendars and assets
- Export data to professional databases

### For Strategy Teams
- Access proven launch frameworks
- Copy-paste content templates
- Track implementation progress
- Analyze performance across creators

### For Operations Teams
- Automate data sync with Airtable/Notion
- Generate reports and analytics
- Manage team workflows
- Scale creator operations

## 📚 Documentation

Comprehensive guides included:
- `AIRTABLE_SETUP.md` - Complete Airtable integration guide
- `NOTION_SETUP.md` - Notion database setup instructions
- `AIRTABLE_INTEGRATION_STATUS.md` - Integration status and testing
- Strategy templates and content frameworks

## 🚀 Deployment

### Netlify (Recommended)
The project includes Netlify configuration:
```bash
# Build command
npm run build

# Publish directory
.next
```

### Manual Deployment
1. Run `npm run build`
2. Deploy the `.next` folder to your hosting provider
3. Configure environment variables if using live integrations

## 🔄 Data Persistence

- **Local Storage**: All creator and content data persists across sessions
- **Real-time Sync**: Optional integration with Airtable/Notion
- **Export Options**: CSV exports for backup and migration

## 🎉 Success Stories

The platform has been designed based on proven creator launch strategies:
- Strategic pricing and urgency marketing
- Scarcity-driven demand generation
- Personal access and community building
- Performance tracking and optimization

## 📞 Support

For questions about setup, integration, or usage:
1. Check the included documentation files
2. Review the demo data and examples
3. Test integrations with demo mode first
4. Follow step-by-step setup guides

---

**Built for professional creator management teams who need enterprise-grade tools with startup agility.**