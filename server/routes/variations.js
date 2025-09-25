const express = require('express');
const router = express.Router();
const database = require('../models/database');
const nanoBananaService = require('../services/nanoBananaService');

// Initialize database connection
database.connect().catch(console.error);

// Generate variations for an ad
router.post('/generate', async (req, res) => {
  try {
    const { adId, variationTypes = ['urgency', 'social_proof', 'benefit', 'problem_agitation', 'offer'] } = req.body;
    
    if (!adId) {
      return res.status(400).json({ error: 'Ad ID is required' });
    }
    
    // Get the original ad
    const ad = await database.get('SELECT * FROM ads WHERE id = ?', [adId]);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    const variations = [];
    
    // Generate each variation type
    for (const variationType of variationTypes.slice(0, 5)) { // Limit to 5
      try {
        // Generate copy variation
        const copyVariation = await nanoBananaService.generateCopyVariation(ad, variationType);
        
        // Calculate ROAS prediction score
        const roasScore = calculateROASPrediction(ad, variationType, copyVariation);
        
        // Save variation to database
        const result = await database.run(`
          INSERT INTO ad_variations (
            original_ad_id, variation_type, headline, description, cta_text,
            roas_prediction_score, conversion_elements
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          adId, variationType, copyVariation.headline, copyVariation.description,
          copyVariation.ctaText, roasScore, JSON.stringify(copyVariation.reasoning || {})
        ]);
        
        variations.push({
          id: result.id,
          original_ad_id: adId,
          variation_type: variationType,
          headline: copyVariation.headline,
          description: copyVariation.description,
          cta_text: copyVariation.ctaText,
          roas_prediction_score: roasScore,
          conversion_elements: copyVariation.reasoning || {},
          created_at: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`Error generating ${variationType} variation:`, error);
        // Continue with other variations
      }
    }
    
    res.json(variations);
  } catch (error) {
    console.error('Error generating variations:', error);
    res.status(500).json({ error: 'Failed to generate variations' });
  }
});

// Get variations for an ad
router.get('/ad/:adId', async (req, res) => {
  try {
    const variations = await database.all(
      'SELECT * FROM ad_variations WHERE original_ad_id = ? ORDER BY roas_prediction_score DESC',
      [req.params.adId]
    );
    
    const processedVariations = variations.map(variation => ({
      ...variation,
      conversion_elements: variation.conversion_elements ? JSON.parse(variation.conversion_elements) : {}
    }));
    
    res.json(processedVariations);
  } catch (error) {
    console.error('Error fetching variations:', error);
    res.status(500).json({ error: 'Failed to fetch variations' });
  }
});

// Update variation
router.put('/:id', async (req, res) => {
  try {
    const { headline, description, cta_text, roas_prediction_score } = req.body;
    
    const result = await database.run(`
      UPDATE ad_variations 
      SET headline = ?, description = ?, cta_text = ?, roas_prediction_score = ?
      WHERE id = ?
    `, [headline, description, cta_text, roas_prediction_score, req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Variation not found' });
    }
    
    const updatedVariation = await database.get('SELECT * FROM ad_variations WHERE id = ?', [req.params.id]);
    
    res.json({
      ...updatedVariation,
      conversion_elements: updatedVariation.conversion_elements ? JSON.parse(updatedVariation.conversion_elements) : {}
    });
  } catch (error) {
    console.error('Error updating variation:', error);
    res.status(500).json({ error: 'Failed to update variation' });
  }
});

// Delete variation
router.delete('/:id', async (req, res) => {
  try {
    const result = await database.run('DELETE FROM ad_variations WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Variation not found' });
    }
    
    res.json({ message: 'Variation deleted successfully' });
  } catch (error) {
    console.error('Error deleting variation:', error);
    res.status(500).json({ error: 'Failed to delete variation' });
  }
});

// Export variations
router.post('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { variationIds } = req.body;
    
    if (!Array.isArray(variationIds) || variationIds.length === 0) {
      return res.status(400).json({ error: 'Variation IDs array is required' });
    }
    
    // Get variations with original ad data
    const variations = await database.all(`
      SELECT 
        av.*,
        a.client_id,
        a.ad_platform,
        c.name as client_name
      FROM ad_variations av
      JOIN ads a ON av.original_ad_id = a.id
      JOIN clients c ON a.client_id = c.id
      WHERE av.id IN (${variationIds.map(() => '?').join(',')})
    `, variationIds);
    
    if (format === 'csv') {
      const csv = generateCSVExport(variations);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ad_variations.csv"');
      res.send(csv);
    } else if (format === 'facebook') {
      const facebookData = generateFacebookExport(variations);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="facebook_ads.json"');
      res.json(facebookData);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
    
  } catch (error) {
    console.error('Error exporting variations:', error);
    res.status(500).json({ error: 'Failed to export variations' });
  }
});

// Helper function to calculate ROAS prediction
function calculateROASPrediction(originalAd, variationType, copyVariation) {
  let score = 50; // Base score
  
  // Variation type multipliers based on performance data
  const typeMultipliers = {
    'urgency': 1.2,
    'social_proof': 1.1,
    'benefit': 1.0,
    'problem_agitation': 0.9,
    'offer': 1.3
  };
  
  score *= (typeMultipliers[variationType] || 1.0);
  
  // Original ad performance boost
  if (originalAd.engagement_score > 1000) score += 10;
  if (originalAd.ad_longevity_days > 30) score += 15;
  
  // Copy quality indicators
  if (copyVariation.headline && copyVariation.headline.length > 20) score += 5;
  if (copyVariation.description && copyVariation.description.length > 50) score += 5;
  if (copyVariation.ctaText && copyVariation.ctaText.toLowerCase().includes('buy')) score += 10;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Helper function to generate CSV export
function generateCSVExport(variations) {
  const headers = [
    'ID', 'Client', 'Variation Type', 'Headline', 'Description', 
    'CTA', 'ROAS Prediction', 'Created At'
  ];
  
  const rows = variations.map(v => [
    v.id,
    v.client_name,
    v.variation_type,
    `"${v.headline}"`,
    `"${v.description}"`,
    `"${v.cta_text || ''}"`,
    v.roas_prediction_score,
    v.created_at
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Helper function to generate Facebook Ads Manager export
function generateFacebookExport(variations) {
  return variations.map(v => ({
    name: `${v.variation_type}_variation_${v.id}`,
    headline: v.headline,
    description: v.description,
    call_to_action: v.cta_text,
    notes: `ROAS Prediction: ${v.roas_prediction_score}% - Generated by FB Ad Repurposer`
  }));
}

module.exports = router;