# Facebook Ad Repurposer MVP

## Overview
ROAS-focused Facebook ad variation generator with **cost-per-call ads support** for agency clients using Apify scraper and Nano Banana AI.

## Features
- 📞 **Cost-per-call ads support** with call tracking and performance metrics
- 🎯 Scrape high-performing Facebook ads via Apify
- 🤖 Generate 5 profitable ad variations ranked by ROAS potential
- 📊 Call performance dashboard (cost-per-call, call volume, conversion rates)
- 🎨 Nano Banana integration for cost-effective image generation
- 👥 Client workspace management
- 📤 Facebook Ads Manager export
- 🧪 Comprehensive test suite (17/20 tests passing)

## Tech Stack
- **Backend**: Node.js/Express
- **Database**: SQLite (enhanced with call ad fields)
- **Frontend**: React with TypeScript
- **AI**: Nano Banana (Gemini 2.5 Flash Image)
- **Scraping**: Apify Facebook Ad Scraper
- **Testing**: Playwright

## Call Ads Support ✨
- **Phone number tracking** and call-to-action optimization
- **Business hours** configuration for call availability
- **Cost-per-call metrics** and ROI tracking
- **Call quality scoring** and conversion rate monitoring
- **Call-optimized variations** for all 5 ROAS types

## Development Setup
```bash
npm install
npm run dev
```

## Testing
```bash
npm test
```

## API Keys Required
- Apify API Key
- Google Gemini API Key (for Nano Banana)
- OpenAI/Claude API Key (for copy generation)
