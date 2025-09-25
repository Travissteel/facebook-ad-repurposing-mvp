const express = require('express');
const router = express.Router();
const powerAdSpyService = require('../services/powerAdSpyService');
const database = require('../models/database');

// Initialize database connection
database.connect().catch(console.error);

// Global scraping status
let scrapingStatus = {
  running: false,
  progress: 0,
  message: 'Ready to scrape',
  lastRun: null
};

// Scrape Facebook ads
router.post('/facebook', async (req, res) => {
  try {
    const {
      searchTerm,
      country = 'US',
      maxAds = 50,
      industry,
      minEngagement = 100
    } = req.body;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    // Update scraping status
    scrapingStatus = {
      running: true,
      progress: 0,
      message: `Scraping ads for "${searchTerm}"`,
      lastRun: new Date().toISOString()
    };
    
    console.log(`🔍 Starting Facebook ad scraping for: ${searchTerm}`);
    
    // Start scraping with PowerAdSpy service
    const scrapingPromise = powerAdSpyService.scrapeFacebookAds({
      searchTerm,
      country,
      maxAds,
      industry,
      minEngagement
    });
    
    // Update progress periodically
    const progressInterval = setInterval(() => {
      if (scrapingStatus.running) {
        scrapingStatus.progress = Math.min(90, scrapingStatus.progress + 10);
      }
    }, 2000);
    
    try {
      const scrapedAds = await scrapingPromise;
      
      // Clear progress interval
      clearInterval(progressInterval);
      
      // Update final status
      scrapingStatus = {
        running: false,
        progress: 100,
        message: `Successfully scraped ${scrapedAds.length} ads`,
        lastRun: new Date().toISOString()
      };
      
      console.log(`✅ Scraping completed: ${scrapedAds.length} ads found`);
      
      // Return the scraped ads
      res.json({
        success: true,
        ads: scrapedAds,
        count: scrapedAds.length,
        searchTerm,
        scrapedAt: new Date().toISOString()
      });
      
    } catch (scrapingError) {
      clearInterval(progressInterval);
      
      scrapingStatus = {
        running: false,
        progress: 0,
        message: `Scraping failed: ${scrapingError.message}`,
        lastRun: new Date().toISOString()
      };
      
      throw scrapingError;
    }
    
  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    scrapingStatus = {
      running: false,
      progress: 0,
      message: `Error: ${error.message}`,
      lastRun: new Date().toISOString()
    };
    
    res.status(500).json({ 
      error: 'Failed to scrape Facebook ads',
      message: error.message 
    });
  }
});

// Get scraping status
router.get('/status', (req, res) => {
  res.json(scrapingStatus);
});

// Get PowerAdSpy service status and capabilities
router.get('/service-status', async (req, res) => {
  try {
    const serviceStatus = powerAdSpyService.getStatus();

    res.json({
      ...serviceStatus,
      capabilities: {
        webScraping: serviceStatus.capabilities.webScraping,
        facebookAdLibrary: serviceStatus.capabilities.facebookAdLibrary,
        apiAccess: serviceStatus.capabilities.apiAccess,
        fallbackToMock: true
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting PowerAdSpy status:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: error.message
    });
  }
});

// Import scraped ads for a client
router.post('/import/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { ads } = req.body;
    
    if (!Array.isArray(ads) || ads.length === 0) {
      return res.status(400).json({ error: 'Ads array is required' });
    }
    
    // Verify client exists
    const client = await database.get('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const importedAds = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const adData of ads) {
      try {
        const result = await database.run(`
          INSERT INTO ads (
            client_id, ad_url, ad_platform, headline, description, cta_text,
            image_url, video_url, engagement_score, estimated_spend,
            ad_longevity_days, performance_indicators
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          clientId,
          adData.adUrl,
          adData.platform || 'facebook',
          adData.headline,
          adData.description,
          adData.ctaText,
          adData.primaryImage,
          adData.primaryVideo,
          adData.engagementScore || 0,
          adData.estimatedSpend || 0,
          adData.adLongevityDays || 0,
          JSON.stringify(adData.conversionElements || {})
        ]);
        
        importedAds.push({ 
          id: result.id, 
          success: true,
          adUrl: adData.adUrl,
          headline: adData.headline
        });
        successCount++;
        
      } catch (error) {
        console.error('Error importing ad:', error);
        importedAds.push({ 
          error: error.message, 
          success: false,
          adUrl: adData.adUrl,
          headline: adData.headline
        });
        errorCount++;
      }
    }
    
    res.json({
      message: `Imported ${successCount} of ${ads.length} ads successfully`,
      successCount,
      errorCount,
      results: importedAds
    });
    
  } catch (error) {
    console.error('Error importing scraped ads:', error);
    res.status(500).json({ error: 'Failed to import ads' });
  }
});

// Get scraping history
router.get('/history', async (req, res) => {
  try {
    // Get recent scraping activity by looking at ad creation times
    const recentAds = await database.all(`
      SELECT 
        a.scraped_at,
        a.ad_platform,
        c.name as client_name,
        COUNT(*) as ads_count
      FROM ads a
      JOIN clients c ON a.client_id = c.id
      WHERE a.scraped_at IS NOT NULL
      GROUP BY DATE(a.scraped_at), a.client_id
      ORDER BY a.scraped_at DESC
      LIMIT 10
    `);
    
    res.json({
      recentActivity: recentAds,
      lastScraping: scrapingStatus.lastRun
    });
    
  } catch (error) {
    console.error('Error fetching scraping history:', error);
    res.status(500).json({ error: 'Failed to fetch scraping history' });
  }
});

// Cancel ongoing scraping (if possible)
router.post('/cancel', (req, res) => {
  if (scrapingStatus.running) {
    scrapingStatus = {
      running: false,
      progress: 0,
      message: 'Scraping cancelled by user',
      lastRun: new Date().toISOString()
    };
    
    res.json({ message: 'Scraping cancelled successfully' });
  } else {
    res.json({ message: 'No active scraping to cancel' });
  }
});

module.exports = router;