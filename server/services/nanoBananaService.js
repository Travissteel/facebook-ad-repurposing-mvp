const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class NanoBananaService {
  constructor() {
    // Initialize Gemini for image generation
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image-preview" // Nano Banana model
    });
    
    // Initialize OpenAI for enhanced copy generation
    this.openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key' 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    
    this.dailyImageCount = 0;
    this.dailyLimit = 100; // Free tier daily limit
    this.costPerImage = 0.039; // Cost after free tier
    
    // Log API availability
    console.log(`🎨 Gemini API: ${this.genAI ? 'Available' : 'Not configured'}`);
    console.log(`📝 OpenAI API: ${this.openai ? 'Available' : 'Not configured'}`);
  }

  /**
   * Generate ad image variations using Nano Banana
   * @param {Object} options - Image generation options
   * @param {string} options.originalImageUrl - URL of original ad image
   * @param {string} options.prompt - Generation prompt
   * @param {string} options.variationType - Type of variation
   * @returns {Object} Generated image data
   */
  async generateImageVariation(options = {}) {
    try {
      const {
        originalImageUrl,
        prompt,
        variationType = 'general',
        style = 'facebook-ad'
      } = options;

      // Check daily limits
      if (this.dailyImageCount >= this.dailyLimit) {
        console.warn(`⚠️ Daily free limit reached (${this.dailyLimit}). Additional images will cost $${this.costPerImage} each.`);
      }

      console.log(`🎨 Generating ${variationType} image variation with Nano Banana`);

      let result;
      
      if (originalImageUrl) {
        // Edit existing image
        result = await this.editImage(originalImageUrl, prompt);
      } else {
        // Generate new image from text
        result = await this.generateImageFromText(prompt, style);
      }

      this.dailyImageCount++;
      
      return {
        imageUrl: result.imageUrl,
        variationType,
        generatedAt: new Date().toISOString(),
        cost: this.dailyImageCount > this.dailyLimit ? this.costPerImage : 0,
        dailyCount: this.dailyImageCount
      };

    } catch (error) {
      console.error('❌ Nano Banana image generation error:', error.message);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Edit existing image using Nano Banana
   * @param {string} imageUrl - Original image URL
   * @param {string} editPrompt - How to modify the image
   * @returns {Object} Edited image data
   */
  async editImage(imageUrl, editPrompt) {
    try {
      // Download original image
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Convert to base64
      const imageBase64 = imageBuffer.toString('base64');
      
      // Create the prompt for image editing
      const fullPrompt = `Edit this Facebook ad image: ${editPrompt}. 
        Maintain professional Facebook ad quality and keep the image engaging for social media.
        Ensure text is readable and the overall composition is balanced.`;

      // Generate edited image
      const result = await this.model.generateContent([
        fullPrompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      // Process and save the result
      return await this.processGeneratedImage(result);

    } catch (error) {
      console.error('❌ Image editing error:', error.message);
      throw error;
    }
  }

  /**
   * Generate new image from text prompt
   * @param {string} textPrompt - Text description for image
   * @param {string} style - Image style
   * @returns {Object} Generated image data
   */
  async generateImageFromText(textPrompt, style = 'facebook-ad') {
    try {
      const stylePrompts = {
        'facebook-ad': 'Create a professional Facebook ad image that is eye-catching, modern, and suitable for social media advertising. High quality, clean composition.',
        'product-focused': 'Create a product-focused image suitable for Facebook ads, with clean background and professional product presentation.',
        'lifestyle': 'Create a lifestyle image showing the product or service in use, suitable for Facebook advertising with authentic, engaging composition.',
        'promotional': 'Create a promotional Facebook ad image with bold, attention-grabbing design suitable for sales and offers.'
      };

      const fullPrompt = `${stylePrompts[style] || stylePrompts['facebook-ad']} ${textPrompt}`;

      console.log(`🎨 Generating new image: ${fullPrompt}`);

      // Generate image
      const result = await this.model.generateContent([fullPrompt]);

      return await this.processGeneratedImage(result);

    } catch (error) {
      console.error('❌ Text-to-image generation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate multiple variations for an ad
   * @param {Object} adData - Original ad data
   * @param {Array} variationTypes - Types of variations to create
   * @returns {Array} Array of generated variations
   */
  async generateAdVariations(adData, variationTypes = []) {
    const variations = [];
    
    for (const variationType of variationTypes) {
      try {
        const prompt = this.createVariationPrompt(adData, variationType);
        
        const variation = await this.generateImageVariation({
          originalImageUrl: adData.primaryImage,
          prompt,
          variationType
        });

        variations.push({
          ...variation,
          originalAdId: adData.id,
          variationType
        });

        // Add small delay to avoid rate limiting
        await this.sleep(1000);

      } catch (error) {
        console.error(`❌ Failed to generate ${variationType} variation:`, error.message);
        // Continue with other variations
      }
    }

    return variations;
  }

  /**
   * Create variation prompt based on type and original ad
   * @param {Object} adData - Original ad data
   * @param {string} variationType - Type of variation
   * @returns {string} Generation prompt
   */
  createVariationPrompt(adData, variationType) {
    const baseInfo = `Original ad: "${adData.headline}" - "${adData.description}"`;
    
    const prompts = {
      'urgency': `${baseInfo}. Create an urgent version with scarcity elements, countdown timers, or limited-time messaging. Add visual urgency cues.`,
      
      'social_proof': `${baseInfo}. Add social proof elements like testimonials, customer reviews, user counts, or trust badges. Show credibility and popularity.`,
      
      'benefit': `${baseInfo}. Focus on the main benefit or transformation. Show before/after, results, or the positive outcome clearly.`,
      
      'problem_agitation': `${baseInfo}. Highlight the problem or pain point more dramatically. Make the viewer feel the frustration they want to solve.`,
      
      'offer': `${baseInfo}. Emphasize the offer, discount, or special deal. Make the value proposition more prominent and compelling.`
    };

    return prompts[variationType] || prompts['benefit'];
  }

  /**
   * Process generated image from Gemini response
   * @param {Object} result - Gemini API response
   * @returns {Object} Processed image data
   */
  async processGeneratedImage(result) {
    try {
      // Extract image data from response
      const response = await result.response;
      const imageData = response.candidates?.[0]?.content?.parts?.[0];
      
      if (!imageData || !imageData.inlineData) {
        throw new Error('No image data in response');
      }

      // Save image to uploads directory
      const filename = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      
      const imageBuffer = Buffer.from(imageData.inlineData.data, 'base64');
      await fs.writeFile(filepath, imageBuffer);

      console.log(`✅ Image saved: ${filename}`);

      return {
        imageUrl: `/uploads/${filename}`,
        localPath: filepath,
        filename,
        size: imageBuffer.length,
        mimeType: imageData.inlineData.mimeType || 'image/jpeg'
      };

    } catch (error) {
      console.error('❌ Error processing generated image:', error.message);
      throw error;
    }
  }

  /**
   * Download image from URL
   * @param {string} url - Image URL
   * @returns {Buffer} Image buffer
   */
  async downloadImage(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ Error downloading image:', error.message);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Get current usage stats
   * @returns {Object} Usage statistics
   */
  getUsageStats() {
    return {
      dailyImageCount: this.dailyImageCount,
      dailyLimit: this.dailyLimit,
      remainingFree: Math.max(0, this.dailyLimit - this.dailyImageCount),
      costPerAdditional: this.costPerImage,
      estimatedCostToday: Math.max(0, (this.dailyImageCount - this.dailyLimit) * this.costPerImage)
    };
  }

  /**
   * Reset daily count (call this daily)
   */
  resetDailyCount() {
    this.dailyImageCount = 0;
    console.log('✅ Daily Nano Banana usage count reset');
  }

  /**
   * Sleep helper function
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate ad copy variations using OpenAI (preferred) or Gemini fallback
   * @param {Object} adData - Original ad data
   * @param {string} variationType - Type of variation
   * @returns {Object} Generated copy variation
   */
  async generateCopyVariation(adData, variationType) {
    try {
      // Try OpenAI first (better for copywriting)
      if (this.openai) {
        return await this.generateCopyWithOpenAI(adData, variationType);
      } else {
        return await this.generateCopyWithGemini(adData, variationType);
      }
    } catch (error) {
      console.error('❌ Copy variation generation error:', error.message);
      // Fallback to Gemini if OpenAI fails
      if (this.openai) {
        console.log('⚠️ Falling back to Gemini for copy generation');
        return await this.generateCopyWithGemini(adData, variationType);
      }
      throw error;
    }
  }

  /**
   * Generate copy using OpenAI GPT for enhanced copywriting
   */
  async generateCopyWithOpenAI(adData, variationType) {
    const systemPrompt = `You are a world-class Facebook ad copywriter specializing in ROAS optimization. Your copy has generated millions in revenue for agencies.

    Focus areas for ${variationType} variations:
    ${this.getVariationFocus(variationType)}

    Rules:
    - Headlines: 25-40 characters (Facebook optimal)
    - Descriptions: 90-125 characters (engagement sweet spot)
    - CTAs: Action-oriented, purchase-intent focused
    - ROAS Priority: Conversions over clicks, sales over engagement
    - Urgency: Create genuine scarcity without being spammy
    - Value: Clear, quantifiable benefits`;

    const userPrompt = `Original high-performing ad:
    Headline: "${adData.headline}"
    Description: "${adData.description}"
    CTA: "${adData.ctaText || 'Learn More'}"

    Create a ${variationType}-focused variation that will likely achieve higher ROAS.

    Return valid JSON only:
    {
      "headline": "new headline (25-40 chars)",
      "description": "new description (90-125 chars)", 
      "ctaText": "new cta",
      "reasoning": "why this should increase ROAS"
    }`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const copyData = JSON.parse(jsonMatch[0]);
      return {
        ...copyData,
        variationType,
        generatedAt: new Date().toISOString(),
        aiModel: 'gpt-4'
      };
    }
    
    throw new Error('Could not parse OpenAI response');
  }

  /**
   * Generate copy using Gemini as fallback
   */
  async generateCopyWithGemini(adData, variationType) {
    const textModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert Facebook ad copywriter focused on ROAS optimization.
      
      Original ad:
      Headline: ${adData.headline}
      Description: ${adData.description}
      CTA: ${adData.ctaText}
      
      Create a ${variationType} variation that will likely increase ROAS. Focus on:
      - Higher conversion potential
      - Clear value proposition
      - Compelling call to action
      - ${this.getVariationFocus(variationType)}
      
      Return JSON format:
      {
        "headline": "new headline",
        "description": "new description",
        "ctaText": "new cta",
        "reasoning": "why this should perform better"
      }`;

    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const copyData = JSON.parse(jsonMatch[0]);
      return {
        ...copyData,
        variationType,
        generatedAt: new Date().toISOString(),
        aiModel: 'gemini-1.5-flash'
      };
    }
    
    throw new Error('Could not parse Gemini response');
  }

  /**
   * Get variation focus description
   * @param {string} variationType - Type of variation
   * @returns {string} Focus description
   */
  getVariationFocus(variationType) {
    const focuses = {
      'urgency': 'Time-sensitive language, scarcity, immediate action',
      'social_proof': 'Trust indicators, testimonials, popularity signals',
      'benefit': 'Clear outcomes, transformations, value delivery',
      'problem_agitation': 'Pain point emphasis, problem awareness',
      'offer': 'Value proposition, discounts, special deals'
    };

    return focuses[variationType] || 'General performance optimization';
  }

  /**
   * Generate 5 ROAS-focused variations for an ad
   * @param {Object} ad - Original ad data
   * @param {Object} client - Client data for optimization
   * @returns {Array} Array of 5 ranked variations
   */
  async generateROASVariations(ad, client) {
    const variationTypes = ['urgency', 'social_proof', 'benefit', 'problem_agitation', 'offer'];
    const variations = [];

    console.log(`🎯 Generating ROAS-focused variations for ad: ${ad.headline}`);

    for (const type of variationTypes) {
      try {
        // Generate copy variation
        const copyVariation = await this.generateCopyVariation(ad, type);
        
        // Generate image variation if original has image
        let imageUrl = ad.image_url;
        if (ad.image_url) {
          const imageResult = await this.generateImageVariation({
            originalImageUrl: ad.image_url,
            prompt: this.createVariationPrompt(ad, type),
            variationType: type
          });
          imageUrl = imageResult.imageUrl;
        }

        // Calculate ROAS score based on variation type and client industry
        const roasScore = this.calculateROASScore(type, copyVariation, client);
        
        // Calculate predictions
        const predictions = this.calculatePredictions(type, copyVariation, client);

        variations.push({
          type: type,
          headline: copyVariation.headline,
          primaryText: copyVariation.description,
          description: copyVariation.reasoning,
          callToAction: copyVariation.ctaText,
          imageUrl: imageUrl,
          roasScore: roasScore,
          predictedCtr: predictions.ctr,
          predictedConversionRate: predictions.conversionRate,
          reasoning: copyVariation.reasoning,
          generatedAt: new Date().toISOString()
        });

        // Small delay between generations
        await this.sleep(500);

      } catch (error) {
        console.error(`❌ Failed to generate ${type} variation:`, error.message);
        // Continue with other variations
      }
    }

    // Sort by ROAS score (highest first)
    variations.sort((a, b) => b.roasScore - a.roasScore);

    console.log(`✅ Generated ${variations.length} ROAS-optimized variations`);
    return variations;
  }

  /**
   * Calculate ROAS score for a variation
   * @param {string} type - Variation type
   * @param {Object} copyData - Generated copy data
   * @param {Object} client - Client data
   * @returns {number} ROAS score (0-100)
   */
  calculateROASScore(type, copyData, client) {
    let baseScore = 50;

    // Type-based scoring
    const typeScores = {
      'urgency': 85,      // High conversion potential
      'offer': 82,        // Direct value proposition
      'benefit': 78,      // Clear outcome focus
      'social_proof': 75, // Trust building
      'problem_agitation': 70 // Problem awareness
    };

    baseScore = typeScores[type] || 50;

    // Industry modifiers
    const industryModifiers = {
      'ecommerce': { 'urgency': +10, 'offer': +15, 'benefit': +5 },
      'saas': { 'benefit': +15, 'social_proof': +10, 'urgency': +5 },
      'health': { 'benefit': +20, 'problem_agitation': +15, 'social_proof': +10 },
      'finance': { 'social_proof': +20, 'urgency': +10, 'benefit': +15 }
    };

    const modifier = industryModifiers[client.industry]?.[type] || 0;
    baseScore += modifier;

    // Copy quality factors
    if (copyData.headline && copyData.headline.length > 10 && copyData.headline.length < 60) {
      baseScore += 5; // Optimal headline length
    }
    
    if (copyData.ctaText && copyData.ctaText.toLowerCase().includes('buy') || 
        copyData.ctaText.toLowerCase().includes('get') ||
        copyData.ctaText.toLowerCase().includes('order')) {
      baseScore += 8; // Purchase-intent CTA
    }

    // Ensure score is within bounds
    return Math.min(Math.max(baseScore, 0), 100);
  }

  /**
   * Calculate performance predictions
   * @param {string} type - Variation type
   * @param {Object} copyData - Generated copy data
   * @param {Object} client - Client data
   * @returns {Object} Predictions object
   */
  calculatePredictions(type, copyData, client) {
    // Base rates by industry
    const industryBaselines = {
      'ecommerce': { ctr: 1.2, conversionRate: 2.8 },
      'saas': { ctr: 0.9, conversionRate: 3.5 },
      'health': { ctr: 1.5, conversionRate: 4.2 },
      'finance': { ctr: 0.8, conversionRate: 5.1 },
      'default': { ctr: 1.0, conversionRate: 3.0 }
    };

    const baseline = industryBaselines[client.industry] || industryBaselines.default;

    // Type multipliers
    const typeMultipliers = {
      'urgency': { ctr: 1.3, conversion: 1.4 },
      'offer': { ctr: 1.2, conversion: 1.6 },
      'benefit': { ctr: 1.1, conversion: 1.3 },
      'social_proof': { ctr: 1.15, conversion: 1.25 },
      'problem_agitation': { ctr: 1.25, conversion: 1.2 }
    };

    const multiplier = typeMultipliers[type] || { ctr: 1.0, conversion: 1.0 };

    return {
      ctr: Math.round((baseline.ctr * multiplier.ctr) * 100) / 100,
      conversionRate: Math.round((baseline.conversionRate * multiplier.conversion) * 100) / 100
    };
  }

  /**
   * Generate single image using prompt
   * @param {string} prompt - Image generation prompt
   * @param {string} baseImageUrl - Optional base image URL
   * @returns {string} Generated image URL
   */
  async generateImage(prompt, baseImageUrl = null) {
    try {
      let result;
      
      if (baseImageUrl) {
        result = await this.editImage(baseImageUrl, prompt);
      } else {
        result = await this.generateImageFromText(prompt);
      }

      this.dailyImageCount++;
      return result.imageUrl;

    } catch (error) {
      console.error('❌ Image generation error:', error.message);
      throw error;
    }
  }
}

module.exports = new NanoBananaService();