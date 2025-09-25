const axios = require('axios');
const cheerio = require('cheerio');

class PowerAdSpyService {
  constructor() {
    this.baseUrl = 'https://poweradspy.com';
    this.apiKey = process.env.POWERADSPY_API_KEY; // If they provide API access
    this.cookieJar = null; // For session management if needed

    // Mock mode when no credentials available
    if (!this.apiKey || this.apiKey === 'test_key') {
      this.mockMode = true;
      console.log('⚠️ PowerAdSpyService: Using mock mode (no API key provided)');
    } else {
      this.mockMode = false;
      console.log('✅ PowerAdSpyService: Initialized with API credentials');
    }

    // Rate limiting
    this.lastRequest = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests to avoid being blocked
  }

  /**
   * Rate limit requests to avoid being blocked
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequest = Date.now();
  }

  /**
   * Search Facebook ads using PowerAdSpy web interface or API
   * @param {Object} options - Search options
   * @param {string} options.searchTerm - What to search for
   * @param {string} options.country - Target country
   * @param {number} options.maxAds - Maximum number of ads to fetch
   * @param {string} options.industry - Industry filter
   * @returns {Array} Array of scraped ad objects
   */
  async scrapeFacebookAds(options = {}) {
    try {
      const {
        searchTerm = '',
        country = 'US',
        maxAds = 50,
        industry = '',
        minEngagement = 100
      } = options;

      console.log(`🔍 PowerAdSpy: Searching for ads - "${searchTerm}"`);

      // If mock mode, return processed sample data
      if (this.mockMode) {
        console.log('⚠️ Using PowerAdSpy mock data');
        const mockAds = this.getMockAds(options);
        return this.processScrapedAds(mockAds, { industry, minEngagement });
      }

      // Try multiple approaches to get data from PowerAdSpy
      let ads = [];

      try {
        // Approach 1: Try API endpoint if available
        ads = await this.tryApiSearch(options);
      } catch (apiError) {
        console.log('⚠️ API search failed, trying web scraping:', apiError.message);

        try {
          // Approach 2: Web scraping approach
          ads = await this.tryWebScraping(options);
        } catch (scrapingError) {
          console.log('⚠️ Web scraping failed, using Facebook Ad Library:', scrapingError.message);

          // Approach 3: Facebook Ad Library API as fallback
          ads = await this.tryFacebookAdLibrary(options);
        }
      }

      console.log(`✅ PowerAdSpy: Found ${ads.length} ads`);

      // Process and filter the results
      return this.processScrapedAds(ads, { industry, minEngagement });

    } catch (error) {
      console.error('❌ PowerAdSpy scraping error:', error.message);
      console.log('⚠️ Falling back to mock data');
      const mockAds = this.getMockAds(options);
      return this.processScrapedAds(mockAds, { industry, minEngagement });
    }
  }

  /**
   * Try to use PowerAdSpy API if available
   */
  async tryApiSearch(options) {
    if (!this.apiKey || this.apiKey === 'test_key') {
      throw new Error('No API key available');
    }

    await this.rateLimit();

    // This would be the structure if PowerAdSpy had a public API
    const response = await axios.get(`${this.baseUrl}/api/search`, {
      params: {
        keyword: options.searchTerm,
        country: options.country,
        limit: options.maxAds,
        platform: 'facebook'
      },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    return response.data.ads || [];
  }

  /**
   * Try web scraping PowerAdSpy (careful with rate limiting)
   */
  async tryWebScraping(options) {
    await this.rateLimit();

    // Build search URL based on PowerAdSpy's interface
    const searchUrl = `${this.baseUrl}/facebook-ad-spy-tool/?search=${encodeURIComponent(options.searchTerm)}&country=${options.country}`;

    console.log(`🕷️ Attempting to scrape: ${searchUrl}`);

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const ads = [];

    // Parse PowerAdSpy's HTML structure (this would need to be adapted to their actual structure)
    $('.ad-item, .ads-item, .facebook-ad').each((index, element) => {
      if (index >= options.maxAds) return false;

      const $ad = $(element);

      const ad = {
        id: $ad.attr('data-id') || `poweradspy_${Date.now()}_${index}`,
        headline: $ad.find('.ad-headline, .headline, h3, h4').first().text().trim(),
        description: $ad.find('.ad-description, .description, .ad-text').first().text().trim(),
        ctaText: $ad.find('.cta, .call-to-action, .btn-text').first().text().trim(),
        imageUrl: $ad.find('img').first().attr('src'),
        videoUrl: $ad.find('video source, .video-url').first().attr('src'),

        // Try to extract engagement metrics
        likes: this.parseNumber($ad.find('.likes, .like-count').text()),
        comments: this.parseNumber($ad.find('.comments, .comment-count').text()),
        shares: this.parseNumber($ad.find('.shares, .share-count').text()),

        // Meta information
        platform: 'facebook',
        source: 'poweradspy',
        adUrl: $ad.find('a').first().attr('href'),
        scrapedAt: new Date().toISOString()
      };

      if (ad.headline && ad.headline.length > 0) {
        ads.push(ad);
      }
    });

    if (ads.length === 0) {
      throw new Error('No ads found in PowerAdSpy response - site structure may have changed');
    }

    return ads;
  }

  /**
   * Use Facebook Ad Library API as fallback
   */
  async tryFacebookAdLibrary(options) {
    console.log('🔄 Falling back to Facebook Ad Library API');

    // Facebook Ad Library API requires access token
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('No Facebook access token available');
    }

    await this.rateLimit();

    const response = await axios.get('https://graph.facebook.com/v18.0/ads_archive', {
      params: {
        access_token: accessToken,
        ad_reached_countries: options.country,
        search_terms: options.searchTerm,
        ad_active_status: 'ACTIVE',
        limit: Math.min(options.maxAds, 100), // Facebook limits to 100
        fields: 'id,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,page_name,impressions'
      },
      timeout: 30000
    });

    return response.data.data.map(ad => ({
      id: ad.id,
      headline: ad.ad_creative_link_titles?.[0] || '',
      description: ad.ad_creative_bodies?.[0] || '',
      ctaText: ad.ad_creative_link_captions?.[0] || '',
      platform: 'facebook',
      source: 'facebook_ad_library',
      pageSource: ad.page_name,
      impressions: ad.impressions,
      scrapedAt: new Date().toISOString()
    }));
  }

  /**
   * Parse number from text (handles "1.2K", "3.5M" format)
   */
  parseNumber(text) {
    if (!text || typeof text !== 'string') return 0;

    const cleanText = text.replace(/[^\d.KkMm]/g, '');
    const number = parseFloat(cleanText);

    if (isNaN(number)) return 0;

    if (cleanText.toLowerCase().includes('k')) return Math.round(number * 1000);
    if (cleanText.toLowerCase().includes('m')) return Math.round(number * 1000000);

    return Math.round(number);
  }

  /**
   * Process and filter scraped ads for ROAS potential
   */
  processScrapedAds(rawAds, filters = {}) {
    const { industry, minEngagement } = filters;

    return rawAds
      .filter(ad => this.isHighPerformanceAd(ad, minEngagement))
      .map(ad => this.normalizeAdData(ad))
      .sort((a, b) => (b.roasPotentialScore || 0) - (a.roasPotentialScore || 0))
      .slice(0, 20); // Return top 20 highest potential ads
  }

  /**
   * Check if an ad shows high performance indicators
   */
  isHighPerformanceAd(ad, minEngagement = 100) {
    const engagement = (ad.likes || 0) + (ad.comments || 0) + (ad.shares || 0);

    // Basic quality filters
    const hasContent = ad.headline && ad.headline.length > 10;
    const hasEngagement = engagement >= minEngagement || ad.impressions > 1000;
    const hasConversionIntent = this.hasConversionSignals(ad);

    return hasContent && (hasEngagement || hasConversionIntent);
  }

  /**
   * Check for conversion/sales signals in ad content
   */
  hasConversionSignals(ad) {
    const text = `${ad.headline || ''} ${ad.description || ''} ${ad.ctaText || ''}`.toLowerCase();

    const conversionKeywords = [
      'buy', 'purchase', 'order', 'shop', 'sale', 'discount', 'save',
      'free shipping', 'limited time', 'offer', 'deal', 'price',
      'get yours', 'claim', 'grab', 'book now', 'sign up', 'free trial'
    ];

    return conversionKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Normalize ad data to standard format
   */
  normalizeAdData(rawAd) {
    const engagement = (rawAd.likes || 0) + (rawAd.comments || 0) + (rawAd.shares || 0);
    const conversionSignals = this.extractConversionElements(rawAd);

    return {
      // Basic ad info
      platform: 'facebook',
      source: rawAd.source || 'poweradspy',
      adUrl: rawAd.adUrl || rawAd.url,
      headline: rawAd.headline || rawAd.title,
      description: rawAd.description || rawAd.body,
      ctaText: rawAd.ctaText || rawAd.callToAction || 'Learn More',

      // Media
      images: rawAd.imageUrl ? [rawAd.imageUrl] : [],
      videos: rawAd.videoUrl ? [rawAd.videoUrl] : [],
      primaryImage: rawAd.imageUrl,
      primaryVideo: rawAd.videoUrl,

      // Performance indicators
      engagementScore: engagement,
      likes: rawAd.likes || 0,
      comments: rawAd.comments || 0,
      shares: rawAd.shares || 0,
      impressions: rawAd.impressions || 0,
      estimatedSpend: this.estimateAdSpend(rawAd),

      // ROAS potential scoring
      roasPotentialScore: this.calculateROASPotential(rawAd, conversionSignals),
      conversionElements: conversionSignals,

      // Meta info
      scrapedAt: new Date().toISOString(),
      pageSource: rawAd.pageSource
    };
  }

  /**
   * Extract conversion-focused elements from ad
   */
  extractConversionElements(ad) {
    const text = `${ad.headline || ''} ${ad.description || ''}`;

    return {
      urgencyTriggers: this.extractUrgencyTriggers(text),
      offers: this.extractOffers(text),
      painPoints: this.extractPainPoints(text),
      benefits: this.extractBenefits(text),
      socialProof: this.extractSocialProof(ad)
    };
  }

  /**
   * Calculate ROAS potential score (0-100)
   */
  calculateROASPotential(ad, conversionElements) {
    let score = 0;

    // Engagement quality (30 points max)
    const engagement = (ad.likes || 0) + (ad.comments || 0) + (ad.shares || 0);
    const impressions = ad.impressions || 0;
    score += Math.min(30, (engagement + impressions / 100) / 100);

    // Conversion elements (40 points max)
    const elementScore = Object.values(conversionElements).reduce((sum, elements) => {
      return sum + (Array.isArray(elements) ? elements.length : 0);
    }, 0);
    score += Math.min(40, elementScore * 5);

    // Content quality (20 points max)
    const headlineScore = ad.headline ? Math.min(10, ad.headline.length / 5) : 0;
    const descriptionScore = ad.description ? Math.min(10, ad.description.length / 10) : 0;
    score += headlineScore + descriptionScore;

    // Visual quality (10 points max)
    const hasVisuals = (ad.imageUrl ? 5 : 0) + (ad.videoUrl ? 5 : 0);
    score += hasVisuals;

    return Math.round(Math.min(100, score));
  }

  /**
   * Extract urgency triggers from text
   */
  extractUrgencyTriggers(text) {
    const urgencyPatterns = [
      /limited time/i, /today only/i, /ends soon/i, /while supplies last/i,
      /don't wait/i, /act now/i, /hurry/i, /last chance/i, /expires/i
    ];

    return urgencyPatterns.filter(pattern => pattern.test(text));
  }

  /**
   * Extract offers from text
   */
  extractOffers(text) {
    const offerPatterns = [
      /\d+%\s*off/i, /free shipping/i, /buy \d+ get \d+/i,
      /\$\d+\s*off/i, /free trial/i, /money back/i, /guarantee/i
    ];

    return offerPatterns.filter(pattern => pattern.test(text));
  }

  /**
   * Extract pain points mentioned
   */
  extractPainPoints(text) {
    const painPatterns = [
      /tired of/i, /struggling with/i, /frustrated/i, /problem/i,
      /issue/i, /difficult/i, /hard to/i, /pain/i, /stress/i
    ];

    return painPatterns.filter(pattern => pattern.test(text));
  }

  /**
   * Extract benefits mentioned
   */
  extractBenefits(text) {
    const benefitPatterns = [
      /save time/i, /save money/i, /increase/i, /improve/i, /boost/i,
      /enhance/i, /achieve/i, /get more/i, /better/i, /faster/i
    ];

    return benefitPatterns.filter(pattern => pattern.test(text));
  }

  /**
   * Extract social proof elements
   */
  extractSocialProof(ad) {
    const proofElements = [];

    if (ad.likes > 1000) proofElements.push(`${ad.likes} likes`);
    if (ad.comments > 100) proofElements.push(`${ad.comments} comments`);
    if (ad.shares > 50) proofElements.push(`${ad.shares} shares`);
    if (ad.impressions > 10000) proofElements.push(`${ad.impressions} impressions`);

    return proofElements;
  }

  /**
   * Estimate ad spend based on performance indicators
   */
  estimateAdSpend(ad) {
    const engagement = (ad.likes || 0) + (ad.comments || 0) + (ad.shares || 0);
    const impressions = ad.impressions || 0;

    // Rough estimation based on engagement and impressions
    let estimatedSpend = 0;

    if (impressions > 0) {
      // If we have impressions, estimate based on typical CPM
      estimatedSpend = (impressions / 1000) * 5; // Assume $5 CPM
    } else if (engagement > 0) {
      // Fallback to engagement-based estimation
      estimatedSpend = engagement * 0.5;
    }

    return Math.max(50, Math.round(estimatedSpend)); // Minimum $50 spend assumption
  }

  /**
   * Get mock ads for development/testing
   */
  getMockAds(options = {}) {
    console.log(`🎭 PowerAdSpy Mock Mode: Generating realistic ads for "${options.searchTerm || 'general'}"`);

    const mockAds = [
      {
        id: 'poweradspy_mock_1',
        headline: 'Revolutionary AI Marketing Tool - 10X Your ROAS',
        description: 'Join 25,000+ marketers who increased their ROAS by 10X using our AI-powered ad optimization platform. 14-day free trial, no credit card required!',
        ctaText: 'Start Free Trial',
        imageUrl: 'https://via.placeholder.com/400x300?text=AI+Marketing+Tool',
        likes: 3450,
        comments: 289,
        shares: 156,
        impressions: 125000,
        platform: 'facebook',
        source: 'poweradspy_mock',
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'poweradspy_mock_2',
        headline: 'Lose 20 Pounds in 30 Days - Scientifically Proven',
        description: 'Doctor-approved weight loss system used by 75,000+ people. No gym required, no restrictive diets. Just follow our simple 3-step process. 90-day guarantee!',
        ctaText: 'Get Started Today',
        imageUrl: 'https://via.placeholder.com/400x300?text=Weight+Loss+Success',
        videoUrl: 'https://via.placeholder.com/video.mp4',
        likes: 5670,
        comments: 1234,
        shares: 445,
        impressions: 280000,
        platform: 'facebook',
        source: 'poweradspy_mock',
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'poweradspy_mock_3',
        headline: 'Black Friday: 80% Off Everything - 24 Hours Only!',
        description: 'Biggest sale of the year! Premium products at clearance prices. Over 500,000 items available. Limited stock, limited time. Free worldwide shipping!',
        ctaText: 'Shop Now',
        imageUrl: 'https://via.placeholder.com/400x300?text=Black+Friday+80%25+Off',
        likes: 2890,
        comments: 567,
        shares: 890,
        impressions: 195000,
        platform: 'facebook',
        source: 'poweradspy_mock',
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'poweradspy_mock_4',
        headline: 'From $0 to $100K/Year - Passive Income Blueprint',
        description: 'Learn the exact system 50,000+ students used to build 6-figure passive income streams. Step-by-step video course with 1-on-1 mentoring. 60-day money-back guarantee.',
        ctaText: 'Join Masterclass',
        imageUrl: 'https://via.placeholder.com/400x300?text=Passive+Income+Blueprint',
        likes: 4320,
        comments: 678,
        shares: 234,
        impressions: 340000,
        platform: 'facebook',
        source: 'poweradspy_mock',
        scrapedAt: new Date().toISOString()
      }
    ];

    // Filter by search term if provided (more flexible matching)
    let filteredAds = mockAds;
    if (options.searchTerm && options.searchTerm.trim() !== '') {
      const searchLower = options.searchTerm.toLowerCase();
      filteredAds = mockAds.filter(ad =>
        ad.headline.toLowerCase().includes(searchLower) ||
        ad.description.toLowerCase().includes(searchLower) ||
        // Also include ads that contain related keywords
        searchLower.includes('fitness') && (ad.headline.toLowerCase().includes('weight') || ad.headline.toLowerCase().includes('lose')) ||
        searchLower.includes('marketing') && ad.headline.toLowerCase().includes('ai') ||
        searchLower.includes('business') && ad.headline.toLowerCase().includes('ai')
      );

      // If no matches found with strict filtering, return all ads (like a broad search)
      if (filteredAds.length === 0) {
        console.log(`⚠️ No exact matches for "${options.searchTerm}", returning broad results`);
        filteredAds = mockAds;
      }
    }

    return filteredAds.slice(0, options.maxAds || 50);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'PowerAdSpy',
      mockMode: this.mockMode,
      hasApiKey: !!this.apiKey && this.apiKey !== 'test_key',
      capabilities: {
        webScraping: true,
        facebookAdLibrary: !!process.env.FACEBOOK_ACCESS_TOKEN,
        apiAccess: !!this.apiKey && this.apiKey !== 'test_key'
      }
    };
  }
}

module.exports = new PowerAdSpyService();