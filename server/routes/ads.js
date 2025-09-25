const express = require('express');
const router = express.Router();
const database = require('../models/database');

// Initialize database connection
database.connect().catch(console.error);

// Get all ads with optional filtering
router.get('/', async (req, res) => {
  try {
    const { client_id, limit = 50, offset = 0, sort_by = 'created_at' } = req.query;
    
    let query = 'SELECT * FROM ads';
    let params = [];
    
    if (client_id) {
      query += ' WHERE client_id = ?';
      params.push(client_id);
    }
    
    query += ` ORDER BY ${sort_by} DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const ads = await database.all(query, params);
    
    // Parse JSON fields
    const processedAds = ads.map(ad => ({
      ...ad,
      performance_indicators: ad.performance_indicators ? JSON.parse(ad.performance_indicators) : {}
    }));
    
    res.json(processedAds);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Get single ad with variations
router.get('/:id', async (req, res) => {
  try {
    const ad = await database.get('SELECT * FROM ads WHERE id = ?', [req.params.id]);
    
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    // Get variations
    const variations = await database.all(
      'SELECT * FROM ad_variations WHERE original_ad_id = ? ORDER BY roas_prediction_score DESC',
      [req.params.id]
    );
    
    // Process JSON fields
    const processedAd = {
      ...ad,
      performance_indicators: ad.performance_indicators ? JSON.parse(ad.performance_indicators) : {}
    };
    
    const processedVariations = variations.map(variation => ({
      ...variation,
      conversion_elements: variation.conversion_elements ? JSON.parse(variation.conversion_elements) : {}
    }));
    
    res.json({
      ...processedAd,
      variations: processedVariations
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

// Create new ad (manual upload)
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      ad_url,
      ad_type = 'standard',
      headline,
      description,
      cta_text,
      image_url,
      video_url,
      phone_number,
      call_tracking_number,
      business_hours,
      engagement_score = 0,
      estimated_spend = 0,
      ad_longevity_days = 0,
      performance_indicators = {}
    } = req.body;
    
    if (!client_id || !headline) {
      return res.status(400).json({ error: 'Client ID and headline are required' });
    }
    
    const result = await database.run(`
      INSERT INTO ads (
        client_id, ad_url, ad_type, headline, description, cta_text,
        image_url, video_url, phone_number, call_tracking_number, business_hours,
        engagement_score, estimated_spend, ad_longevity_days, performance_indicators
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      client_id, ad_url, ad_type, headline, description, cta_text,
      image_url, video_url, phone_number, call_tracking_number, JSON.stringify(business_hours || {}),
      engagement_score, estimated_spend, ad_longevity_days, JSON.stringify(performance_indicators)
    ]);
    
    const newAd = await database.get('SELECT * FROM ads WHERE id = ?', [result.id]);
    
    res.status(201).json({
      ...newAd,
      performance_indicators: JSON.parse(newAd.performance_indicators || '{}')
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// Update ad
router.put('/:id', async (req, res) => {
  try {
    const {
      ad_type,
      headline,
      description,
      cta_text,
      image_url,
      video_url,
      phone_number,
      call_tracking_number,
      business_hours,
      engagement_score,
      estimated_spend,
      ad_longevity_days,
      performance_indicators
    } = req.body;
    
    const result = await database.run(`
      UPDATE ads SET
        ad_type = ?, headline = ?, description = ?, cta_text = ?, image_url = ?,
        video_url = ?, phone_number = ?, call_tracking_number = ?, business_hours = ?,
        engagement_score = ?, estimated_spend = ?, ad_longevity_days = ?, performance_indicators = ?
      WHERE id = ?
    `, [
      ad_type, headline, description, cta_text, image_url, video_url,
      phone_number, call_tracking_number, JSON.stringify(business_hours || {}),
      engagement_score, estimated_spend, ad_longevity_days,
      JSON.stringify(performance_indicators || {}), req.params.id
    ]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    const updatedAd = await database.get('SELECT * FROM ads WHERE id = ?', [req.params.id]);
    
    res.json({
      ...updatedAd,
      performance_indicators: JSON.parse(updatedAd.performance_indicators || '{}')
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// Delete ad
router.delete('/:id', async (req, res) => {
  try {
    // Delete variations first (foreign key constraint)
    await database.run('DELETE FROM ad_variations WHERE original_ad_id = ?', [req.params.id]);
    
    // Delete the ad
    const result = await database.run('DELETE FROM ads WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// Get high-performing ads for inspiration
router.get('/high-performance/list', async (req, res) => {
  try {
    const { industry, ad_type, min_engagement = 100, limit = 20 } = req.query;
    
    let query = `
      SELECT a.*, c.name as client_name, c.industry
      FROM ads a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.engagement_score >= ?
    `;

    let params = [parseInt(min_engagement)];

    if (industry) {
      query += ' AND c.industry = ?';
      params.push(industry);
    }

    if (ad_type) {
      query += ' AND a.ad_type = ?';
      params.push(ad_type);
    }
    
    query += ' ORDER BY a.engagement_score DESC, a.ad_longevity_days DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const ads = await database.all(query, params);
    
    const processedAds = ads.map(ad => ({
      ...ad,
      performance_indicators: ad.performance_indicators ? JSON.parse(ad.performance_indicators) : {}
    }));
    
    res.json(processedAds);
  } catch (error) {
    console.error('Error fetching high-performance ads:', error);
    res.status(500).json({ error: 'Failed to fetch high-performance ads' });
  }
});

// Bulk import ads (from scraper)
router.post('/bulk-import', async (req, res) => {
  try {
    const { client_id, ads } = req.body;
    
    if (!client_id || !Array.isArray(ads)) {
      return res.status(400).json({ error: 'Client ID and ads array are required' });
    }
    
    const importedAds = [];
    
    for (const adData of ads) {
      try {
        const result = await database.run(`
          INSERT INTO ads (
            client_id, ad_url, ad_platform, ad_type, headline, description, cta_text,
            image_url, video_url, phone_number, call_tracking_number, business_hours,
            engagement_score, estimated_spend, ad_longevity_days, performance_indicators
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          client_id,
          adData.adUrl,
          adData.platform || 'facebook',
          adData.adType || 'standard',
          adData.headline,
          adData.description,
          adData.ctaText,
          adData.primaryImage,
          adData.primaryVideo,
          adData.phoneNumber,
          adData.callTrackingNumber,
          JSON.stringify(adData.businessHours || {}),
          adData.engagementScore || 0,
          adData.estimatedSpend || 0,
          adData.adLongevityDays || 0,
          JSON.stringify(adData.performanceIndicators || {})
        ]);
        
        importedAds.push({ id: result.id, success: true });
      } catch (error) {
        console.error('Error importing ad:', error);
        importedAds.push({ error: error.message, success: false });
      }
    }
    
    res.json({
      message: `Imported ${importedAds.filter(a => a.success).length} of ${ads.length} ads`,
      results: importedAds
    });
  } catch (error) {
    console.error('Error bulk importing ads:', error);
    res.status(500).json({ error: 'Failed to bulk import ads' });
  }
});

module.exports = router;