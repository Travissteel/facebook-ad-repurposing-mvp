# Apify Actor Debug Guide

## Fixed Issues ✅

1. **Credit Waste Prevention**: Actor runs now auto-abort after 10 minutes
2. **Better Error Handling**: Clear 403/401/404 error messages with solutions
3. **Run Monitoring**: Real-time status updates and warnings
4. **Input Validation**: Proper input formatting for your actor
5. **Account Monitoring**: Check credits and usage before running

## Testing Your Actor

### 1. Test Actor Access (RECOMMENDED FIRST)
```bash
node test-actor-access.js
```

This will:
- ✅ Verify your API key works
- ✅ Check your account credits
- ✅ Test actor permissions
- ✅ Validate input format
- ❌ **NOT run the actor** (no credits used)

### 2. Expected Output Types

**✅ SUCCESS**:
```
✅ API Key found: apify_api_...
👤 Account: your-username
📋 Plan: PERSONAL/TEAM
✅ Actor accessible: my-fb-ads-scraper
🚀 Your actor should work with the main application
```

**❌ PERMISSION ISSUE**:
```
❌ Actor access denied (403)
💡 This could mean:
   - The actor is private and you need permission
   - Your API key doesn't have access to this actor
   - The actor ID is incorrect
```

### 3. Start Your Application

If the test passes, start your app:
```bash
npm run server
```

## What's Fixed

### Before (Problems):
- ❌ Ran indefinitely, wasting credits
- ❌ Poor error messages for auth issues
- ❌ No way to stop stuck runs
- ❌ Short 3-minute timeout caused false failures

### After (Fixed):
- ✅ Auto-abort after 10 minutes to save credits
- ✅ Clear error messages with actionable solutions
- ✅ Manual abort capability for stuck runs
- ✅ Proper 10-minute timeout for complex scraping
- ✅ Credit usage monitoring

## New Features

### 1. Credit Monitoring
Check your account status anytime:
```javascript
const apifyService = require('./server/services/apifyMCPService');
const usage = await apifyService.checkAccountUsage();
console.log(usage);
```

### 2. Manual Run Abort
If a run gets stuck, it will auto-abort:
```javascript
// This happens automatically now
await apifyService.abortActorRun(actorId, runId);
```

### 3. Better Input Validation
Your actor input is now properly formatted:
```javascript
// Old (might fail)
{ search_query: "business" }

// New (validated)
{
  "search_query": "business",
  "maxItems": 50,
  "country": "US"
}
```

## Troubleshooting

### Issue: 403 Authentication Error
**Solution**:
1. Run `node test-actor-access.js`
2. Verify actor permissions in Apify Console
3. Check if actor is public or you have access

### Issue: Actor Runs Too Long
**Solution**:
- Runs now auto-abort after 10 minutes
- Warning at 7.5 minutes
- No more indefinite credit waste

### Issue: No Results Found
**Solution**:
1. Check if your search term is valid
2. Verify the actor is working manually in Apify Console
3. Check actor logs for debugging info

### Issue: Rate Limited (429)
**Solution**:
- Wait 5-10 minutes before retrying
- The app will now show clear rate limit messages

## Monitoring Credit Usage

1. **Before starting**: Run `node test-actor-access.js`
2. **During operation**: Check server logs for usage warnings
3. **After scraping**: Monitor your Apify dashboard

## Questions?

1. Is your actor working manually in Apify Console?
2. Does `node test-actor-access.js` pass all checks?
3. Are you seeing specific error codes (403, 404, 429)?

The fixes ensure you won't waste credits on stuck runs while providing clear debugging information.