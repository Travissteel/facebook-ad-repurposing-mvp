# Facebook Ad Repurposing MVP - Setup Guide

## 🚀 Quick Start Guide

This guide will help you set up and run the Facebook Ad Repurposing MVP on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

## 📁 Project Structure

```
facebook-ad-repurposing-mvp/
├── server/                 # Backend (Node.js/Express)
├── client/                 # Frontend (React/TypeScript)
├── tests/                  # Playwright tests
├── uploads/                # Generated images storage
├── database.db             # SQLite database (auto-created)
├── .env                    # Environment variables
└── package.json            # Root dependencies
```

## ⚡ Quick Setup (5 minutes)

### Step 1: Clone and Install Dependencies

```bash
# If you haven't already, navigate to the project directory
cd facebook-ad-repurposing-mvp

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Step 2: Environment Configuration

The project comes with a pre-configured `.env` file with test values:

```bash
# View current environment variables
cat .env
```

**Default configuration:**
```env
# API Keys (placeholder values for testing)
APIFY_API_KEY=test_key
GOOGLE_API_KEY=test_key
OPENAI_API_KEY=test_key

# Database
DATABASE_PATH=./database.db

# Server
PORT=3001
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:3000
```

### Step 3: Start the Application

```bash
# Start both backend and frontend servers
npm run dev
```

This command starts:
- **Backend server** on http://localhost:3001
- **Frontend client** on http://localhost:3000

### Step 4: Verify Setup

1. **Check Backend Health**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"healthy","timestamp":"...","environment":"development"}`

2. **Check Nano Banana Usage**:
   ```bash
   curl http://localhost:3001/api/nano-banana/usage
   ```
   Should return: `{"dailyUsage":0,"dailyLimit":100,"remainingFree":100,"costPerImage":0.039,"todayCost":0}`

3. **Open Frontend**: Navigate to http://localhost:3000 in your browser

## 🎯 Using the MVP (Development Mode)

### Mock Data Mode
The application runs in **mock mode** by default, which means:
- ✅ All features work without real API keys
- ✅ Sample ads and clients are available
- ✅ Variation generation uses mock responses
- ✅ No external API calls or charges

### Basic Workflow

1. **Access Dashboard**: Go to http://localhost:3000
2. **Select Client**: Use the client selector (mock clients available)
3. **View Ads**: Check the Ad Library for sample high-performing ads
4. **Generate Variations**: Go to Variation Studio and generate ROAS-optimized variations
5. **Review Results**: See 5 ranked variations with ROAS scores and predictions

## 🔑 Production API Setup (Optional)

To use real APIs instead of mock data, update your `.env` file:

### Google/Gemini API (for Nano Banana image generation)
1. Get API key from [Google AI Studio](https://aistudio.google.com/)
2. Update `.env`: `GOOGLE_API_KEY=your_real_api_key_here`

### Apify API (for Facebook ad scraping)
1. Get API key from [Apify Console](https://console.apify.com/)
2. Update `.env`: `APIFY_API_KEY=your_real_api_key_here`

### OpenAI API (for enhanced copy generation)
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Update `.env`: `OPENAI_API_KEY=your_real_api_key_here`

After updating API keys, restart the application:
```bash
npm run dev
```

## 🧪 Testing

### Run All Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm test
```

### Individual Test Commands
```bash
# Backend only
npm run server

# Frontend only  
npm run client

# Health check
curl http://localhost:3001/api/health
```

## 📊 Features Available

### ✅ Working Features (Mock Mode)
- **Client Management**: Add/edit clients with industry settings
- **Ad Library**: View imported high-performing ads
- **Variation Studio**: Generate 5 ROAS-optimized variations
- **ROAS Scoring**: Variations ranked by conversion potential
- **Usage Tracking**: Monitor Nano Banana daily limits
- **Performance Dashboard**: View client ROAS metrics

### 🔄 Features (Requires Real APIs)
- **Live Facebook Scraping**: Real competitor ad data
- **AI Image Generation**: Custom ad images via Gemini
- **Advanced Copy Generation**: OpenAI-powered ad copy
- **Real Performance Tracking**: Actual campaign data

## 🎯 MVP Scope & Focus

This MVP focuses on **ROAS optimization** for agency clients:

### Core Methodology
1. **5 Variation Types**:
   - Urgency-focused (scarcity, limited time)
   - Social proof (testimonials, reviews)
   - Benefit-driven (clear outcomes)
   - Problem agitation (pain point emphasis)
   - Offer-optimized (pricing, guarantees)

2. **Industry-Specific Optimization**:
   - E-commerce: Urgency + Offers
   - SaaS: Benefits + Social proof
   - Health: Benefits + Problem agitation
   - Finance: Social proof + Benefits

3. **ROAS Prediction**:
   - Scored 0-100 based on type and industry
   - Predicted CTR and conversion rates
   - Ranked by profitability potential

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill existing processes
pkill -f "node server"
pkill -f "vite"

# Restart
npm run dev
```

**Database Issues**
```bash
# Remove and recreate database
rm database.db
npm run dev
```

**Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

**API Connection Issues**
- Check `.env` file exists in root directory
- Verify server is running on port 3001
- Check console for error messages

### Log Files
- Backend logs: Console output from `npm run server`
- Frontend logs: Browser developer console
- API logs: Network tab in browser dev tools

## 📝 Development Notes

### File Structure
- **Backend Routes**: `/server/routes/`
- **Frontend Components**: `/client/src/components/`
- **API Services**: `/client/src/services/api.ts`
- **Database Models**: `/server/models/database.js`
- **AI Services**: `/server/services/nanoBananaService.js`

### Key Configuration
- **Database**: SQLite (auto-creates on first run)
- **CORS**: Configured for localhost:3000
- **File Uploads**: Stored in `/uploads` directory
- **Environment**: Development mode by default

### Mock vs Production
- **Mock Mode**: No API keys needed, sample data provided
- **Production Mode**: Real APIs, actual scraping and generation
- **Hybrid Mode**: Mix of real and mock services

## 🚀 Next Steps

1. **Beta Testing**: Use mock mode to test workflow
2. **API Integration**: Add real API keys for production features
3. **Client Onboarding**: Import your agency's client data
4. **Campaign Testing**: Generate and test real ad variations
5. **Performance Tracking**: Monitor actual ROAS improvements

## 📞 Support

- **Documentation**: This file and `/facebook_ad_repurposing_mvp.md`
- **Code Issues**: Check console logs and error messages
- **Feature Requests**: Document in project requirements
- **API Limits**: Monitor Nano Banana usage (100 free images/day)

---

🎯 **Ready to start?** Run `npm run dev` and navigate to http://localhost:3000