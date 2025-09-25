const express = require('express');
const nanoBananaService = require('../services/nanoBananaService');
const db = require('../models/database');
const router = express.Router();

// Generate ad variations using ROAS-focused methodology
router.post('/generate-variations', async (req, res) => {
  try {
    const { adId, clientId } = req.body;

    if (!adId || !clientId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: adId and clientId' 
      });
    }

    // Get the original ad data
    const ad = await db.getAd(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Get client data for ROAS optimization
    const client = await db.getClient(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Generate 5 ROAS-focused variations
    const variations = await nanoBananaService.generateROASVariations(ad, client);

    // Store variations in database
    const storedVariations = [];
    for (const variation of variations) {
      const storedVariation = await db.saveAdVariation({
        ad_id: adId,
        client_id: clientId,
        variation_type: variation.type,
        headline: variation.headline,
        primary_text: variation.primaryText,
        description: variation.description,
        call_to_action: variation.callToAction,
        image_url: variation.imageUrl,
        roas_score: variation.roasScore,
        predicted_ctr: variation.predictedCtr,
        predicted_conversion_rate: variation.predictedConversionRate
      });
      storedVariations.push(storedVariation);
    }

    res.json({
      success: true,
      variations: storedVariations,
      dailyUsage: nanoBananaService.dailyImageCount,
      remainingFree: Math.max(0, nanoBananaService.dailyLimit - nanoBananaService.dailyImageCount)
    });

  } catch (error) {
    console.error('Error generating variations:', error);
    res.status(500).json({ 
      error: 'Failed to generate variations',
      message: error.message 
    });
  }
});

// Get daily usage statistics
router.get('/usage', async (req, res) => {
  try {
    const usage = {
      dailyUsage: nanoBananaService.dailyImageCount,
      dailyLimit: nanoBananaService.dailyLimit,
      remainingFree: Math.max(0, nanoBananaService.dailyLimit - nanoBananaService.dailyImageCount),
      costPerImage: nanoBananaService.costPerImage,
      todayCost: Math.max(0, nanoBananaService.dailyImageCount - nanoBananaService.dailyLimit) * nanoBananaService.costPerImage
    };

    res.json(usage);
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ 
      error: 'Failed to get usage statistics',
      message: error.message 
    });
  }
});

// Generate single image variation
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, baseImageUrl } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    const imageUrl = await nanoBananaService.generateImage(prompt, baseImageUrl);

    res.json({
      success: true,
      imageUrl,
      dailyUsage: nanoBananaService.dailyImageCount,
      remainingFree: Math.max(0, nanoBananaService.dailyLimit - nanoBananaService.dailyImageCount)
    });

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

module.exports = router;