# PowerAdSpy Migration Guide

## Overview
Successfully migrated from Apify to PowerAdSpy for Facebook ad scraping functionality.

## Changes Made

### 1. New Service Implementation
- Created `server/services/powerAdSpyService.js`
- Supports multiple data sources:
  - PowerAdSpy web scraping (when available)
  - Facebook Ad Library API (as fallback)
  - Mock data for development/testing

### 2. Dependencies Updated
- **Removed:** `apify`, `apify-client`, `@apify/actors-mcp-server`
- **Added:** `cheerio` for web scraping

### 3. Configuration Changes
- **Environment Variables:**
  - `POWERADSPY_API_KEY` (replace APIFY_API_KEY)
  - `FACEBOOK_ACCESS_TOKEN` (for Ad Library API fallback)

### 4. API Endpoints Updated
- `/api/scraper/facebook` - Now uses PowerAdSpy service
- `/api/scraper/service-status` - Replaces `/api/scraper/mcp-status`

## PowerAdSpy Service Features

### Multi-Source Data Collection
1. **Primary:** PowerAdSpy API (when API key available)
2. **Secondary:** PowerAdSpy web scraping
3. **Fallback:** Facebook Ad Library API
4. **Development:** Realistic mock data

### Enhanced Ad Analysis
- ROAS potential scoring (0-100)
- Conversion signal detection
- Engagement quality metrics
- Social proof extraction
- Urgency trigger identification

### Rate Limiting & Safety
- 2-second delays between requests
- Graceful fallback mechanisms
- Error handling and recovery

## Setup Instructions

### 1. Environment Configuration
```bash
# Optional: PowerAdSpy API key (contact PowerAdSpy for access)
POWERADSPY_API_KEY=your_poweradspy_api_key

# Optional: Facebook Access Token (for Ad Library API)
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Test the Integration
The service runs in mock mode by default and provides realistic test data for development.

## Service Status

### Current Capabilities
- ✅ Mock data generation (realistic Facebook ad data)
- ✅ Ad processing and ROAS scoring
- ✅ Rate limiting and error handling
- ⚠️ PowerAdSpy web scraping (requires testing with live site)
- ⚠️ Facebook Ad Library API (requires Facebook access token)
- ❓ PowerAdSpy API access (requires API key from PowerAdSpy)

### Mock Mode Features
- 4 realistic ad examples across different industries
- Smart search filtering and broad matching
- Full ROAS calculation pipeline
- Conversion element extraction
- Social proof metrics

## Migration Benefits

1. **Reduced Dependencies:** Removed complex Apify MCP infrastructure
2. **Multiple Data Sources:** Not dependent on single provider
3. **Better Mock Data:** More realistic development experience
4. **Enhanced Analytics:** Improved ROAS scoring and ad analysis
5. **Flexible Architecture:** Easy to add new data sources

## Next Steps

1. **Obtain PowerAdSpy API Access:** Contact PowerAdSpy for API documentation and keys
2. **Facebook Developer Setup:** Create Facebook app for Ad Library API access
3. **Live Testing:** Test web scraping approach with PowerAdSpy
4. **Monitoring:** Set up logging for production data collection

## Troubleshooting

### Service Running in Mock Mode
- Expected behavior when no API keys configured
- Provides realistic test data for development
- Check environment variables for API key configuration

### No Ads Returned
- Check search terms and filters
- Verify API keys and rate limits
- Review service logs for error details

### Performance Issues
- Rate limiting may slow requests (by design)
- Consider caching frequently requested data
- Monitor API usage and costs

## API Compatibility

The new PowerAdSpy service maintains the same interface as the original Apify integration, ensuring no frontend changes are required.