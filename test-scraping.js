// Test script to verify live scraping configuration
const axios = require('axios');

async function testScrapingSetup() {
  const API_KEY = process.env.APIFY_API_KEY || 'your_your_apify_api_key_here_here';
  
  console.log('🔍 Testing Apify API configuration...');
  
  // Test 1: Check if API key is valid
  try {
    const response = await axios.get('https://api.apify.com/v2/acts', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      params: {
        limit: 5
      }
    });
    
    console.log('✅ API Key Valid - Can access Apify acts');
    console.log(`   Found ${response.data.data.total} total actors available`);
  } catch (error) {
    console.log('❌ API Key Invalid:', error.message);
    return;
  }
  
  // Test 2: Check specific Facebook actors
  const facebookActors = [
    'apify/facebook-posts-scraper',
    'apify/facebook-pages-scraper'
  ];
  
  for (const actorId of facebookActors) {
    try {
      const response = await axios.get(`https://api.apify.com/v2/acts/${actorId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      const actor = response.data.data;
      console.log(`✅ ${actorId}:`);
      console.log(`   Name: ${actor.title}`);
      console.log(`   Runs: ${actor.stats.totalRuns.toLocaleString()}`);
      console.log(`   Users: ${actor.stats.totalUsers.toLocaleString()}`);
    } catch (error) {
      console.log(`❌ ${actorId}: ${error.response?.status} - ${error.message}`);
    }
  }
  
  // Test 3: Check current scraping mode in app
  try {
    const response = await axios.get('http://localhost:3001/api/scraper/mcp-status');
    console.log('\n🔧 Current App Configuration:');
    console.log(`   Mock Mode: ${response.data.mockMode}`);
    console.log(`   Has API Token: ${response.data.hasApiToken}`);
    console.log(`   Available Actors: ${response.data.actorCount}`);
    
    if (response.data.mockMode) {
      console.log('⚠️  App is currently in MOCK MODE');
      console.log('   This means you\'re seeing test data, not real scraped ads');
    } else {
      console.log('✅ App is configured for LIVE SCRAPING');
    }
  } catch (error) {
    console.log('❌ Cannot connect to local app:', error.message);
  }
}

testScrapingSetup().catch(console.error);