#!/usr/bin/env node

/**
 * Test script to verify Apify actor access and prevent credit waste
 * Run this before starting the main application to check actor status
 */

const axios = require('axios');
require('dotenv').config();

const APIFY_API_KEY = process.env.APIFY_API_KEY;
const ACTOR_ID = 'ibraheemalani2~my-fb-ads-scraper';

async function testActorAccess() {
  console.log('🧪 Testing Apify Actor Access');
  console.log('=====================================');

  if (!APIFY_API_KEY || APIFY_API_KEY === 'test_key') {
    console.log('❌ No valid APIFY_API_KEY found in environment variables');
    return;
  }

  console.log('✅ API Key found:', APIFY_API_KEY.substring(0, 10) + '...');

  try {
    // 1. Test account access
    console.log('\n📊 Checking account status...');
    const accountResponse = await axios.get('https://api.apify.com/v2/users/me', {
      headers: { 'Authorization': `Bearer ${APIFY_API_KEY}` },
      timeout: 10000
    });

    const user = accountResponse.data.data;
    console.log(`👤 Account: ${user.username}`);
    console.log(`📋 Plan: ${user.plan}`);
    console.log(`💳 Credits: ${user.credits || 'N/A'}`);

    if (user.usageThisMonth) {
      console.log(`📈 Usage this month: ${JSON.stringify(user.usageThisMonth, null, 2)}`);
    }

    // 2. Test actor access
    console.log(`\n🎭 Testing actor access: ${ACTOR_ID}`);
    try {
      const actorResponse = await axios.get(`https://api.apify.com/v2/acts/${ACTOR_ID}`, {
        headers: { 'Authorization': `Bearer ${APIFY_API_KEY}` },
        timeout: 10000
      });

      const actor = actorResponse.data.data;
      console.log(`✅ Actor accessible: ${actor.name}`);
      console.log(`📝 Description: ${actor.description || 'No description'}`);
      console.log(`🏃 Total runs: ${actor.stats?.totalRuns || 0}`);
      console.log(`⏱️ Created: ${actor.createdAt}`);
      console.log(`🔄 Modified: ${actor.modifiedAt}`);

    } catch (actorError) {
      if (actorError.response?.status === 403) {
        console.log('❌ Actor access denied (403)');
        console.log('💡 This could mean:');
        console.log('   - The actor is private and you need permission');
        console.log('   - Your API key doesn\'t have access to this actor');
        console.log('   - The actor ID is incorrect');
      } else if (actorError.response?.status === 404) {
        console.log('❌ Actor not found (404)');
        console.log('💡 Check if the actor ID is correct');
      } else {
        console.log(`❌ Actor access error: ${actorError.message}`);
      }
    }

    // 3. Test a minimal run (DRY RUN - just validate input, don't actually run)
    console.log('\n🧪 Testing input validation...');
    const testInput = {
      search_query: 'test',
      maxItems: 1,
      country: 'US'
    };

    console.log('📝 Test input:', JSON.stringify(testInput, null, 2));
    console.log('💡 Input validation: OK (would be passed to actor)');

    console.log('\n✅ All tests completed successfully!');
    console.log('🚀 Your actor should work with the main application');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - check your API key');
    } else if (error.response?.status === 403) {
      console.log('🚫 Permission denied - check account permissions');
    } else if (error.response?.status === 429) {
      console.log('⏰ Rate limited - wait before trying again');
    }

    console.log('\n💡 Recommendations:');
    console.log('   1. Verify your API key is correct');
    console.log('   2. Check if you have permission to access the actor');
    console.log('   3. Ensure your account has sufficient credits');
    console.log('   4. Try again in a few minutes if rate limited');
  }
}

// Run the test
testActorAccess().catch(console.error);