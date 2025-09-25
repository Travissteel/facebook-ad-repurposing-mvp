import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClient } from '../context/ClientContext';
import { adService, nanoBananaService } from '../services/api';
import type { Ad, AdVariation } from '../types';
import { Palette, Wand2, Target, Clock, Users, Gift, AlertTriangle } from 'lucide-react';

export const VariationStudio: React.FC = () => {
  const { selectedClient } = useClient();
  const [clientAds, setClientAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [generatedVariations, setGeneratedVariations] = useState<AdVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nanoBananaUsage, setNanoBananaUsage] = useState({ dailyUsage: 0, remainingFree: 100 });
  const [error, setError] = useState<string | null>(null);

  const getVariationTypes = (adType: string = 'standard') => {
    const baseTypes = [
      {
        id: 'urgency',
        name: 'Urgency-Focused',
        description: 'Limited time offers, scarcity messaging, countdown timers',
        icon: Clock,
        color: 'roas-excellent',
        examples: adType === 'call'
          ? ['Call Now - Limited Time!', 'Only 24 Hours - Call Today!', 'Urgent - Call Before Midnight!']
          : ['Limited Time!', 'Only 24 Hours Left', 'While Supplies Last']
      },
      {
        id: 'social_proof',
        name: 'Social Proof',
        description: 'Testimonials, reviews, user counts, trust indicators',
        icon: Users,
        color: 'roas-good',
        examples: adType === 'call'
          ? ['10,000+ Satisfied Callers', 'Call - Join 5-Star Clients', '50,000+ Calls Answered']
          : ['10,000+ Happy Customers', '5-Star Reviews', 'As Seen On TV']
      },
      {
        id: 'benefit',
        name: 'Benefit-Driven',
        description: 'Outcome focus, transformations, clear value propositions',
        icon: Target,
        color: 'roas-average',
        examples: adType === 'call'
          ? ['Get Results in One Call', 'Call for Instant Solutions', 'One Call = 50% Savings']
          : ['Save 50% More Time', 'Double Your Revenue', 'Lose 20 Pounds']
      },
      {
        id: 'problem_agitation',
        name: 'Problem Agitation',
        description: 'Pain point emphasis, problem awareness amplification',
        icon: AlertTriangle,
        color: 'roas-poor',
        examples: adType === 'call'
          ? ['Tired of Waiting? Call Now!', 'Still Struggling? Call Today!', 'Fed Up? One Call Fixes It!']
          : ['Tired of...?', 'Struggling with...?', 'Fed up with...?']
      },
      {
        id: 'offer',
        name: 'Offer-Optimized',
        description: 'Pricing focus, bonuses, guarantees, risk reversal',
        icon: Gift,
        color: 'roas-excellent',
        examples: adType === 'call'
          ? ['Free Consultation - Call Now', 'Call Today - No Obligation', '100% Risk-Free Call']
          : ['50% Off Today', 'Money-Back Guarantee', 'Free Shipping']
      }
    ];
    return baseTypes;
  };

  const variationTypes = getVariationTypes(selectedAd?.ad_type);

  // Load client ads when client changes
  useEffect(() => {
    if (selectedClient) {
      loadClientAds();
      loadNanoBananaUsage();
    }
  }, [selectedClient]);

  const loadClientAds = async () => {
    try {
      if (!selectedClient) return;
      const ads = await adService.getAll({ client_id: selectedClient.id });
      setClientAds(ads);
      if (ads.length > 0) {
        setSelectedAd(ads[0]);
      }
    } catch (error) {
      console.error('Failed to load client ads:', error);
      setError('Failed to load ads for this client');
    }
  };

  const loadNanoBananaUsage = async () => {
    try {
      const usage = await nanoBananaService.getUsage();
      setNanoBananaUsage({
        dailyUsage: usage.dailyUsage,
        remainingFree: usage.remainingFree
      });
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const handleGenerateVariations = async () => {
    if (!selectedAd || !selectedClient || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await nanoBananaService.generateVariations(selectedAd.id, selectedClient.id);
      setGeneratedVariations(result.variations);
      setNanoBananaUsage({
        dailyUsage: result.dailyUsage,
        remainingFree: result.remainingFree
      });
    } catch (error: any) {
      console.error('Failed to generate variations:', error);
      setError(error.response?.data?.message || 'Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const getROASBadgeColor = (score: number) => {
    if (score >= 85) return 'roas-excellent';
    if (score >= 75) return 'roas-good';
    if (score >= 65) return 'roas-average';
    return 'roas-poor';
  };

  if (!selectedClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variation Studio</CardTitle>
          <CardDescription>Select a client to start creating ad variations</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Variation Studio</h2>
          <p className="text-muted-foreground">
            Generate 5 high-converting variations for {selectedClient.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Usage: {nanoBananaUsage.dailyUsage}/100 free images today
            {nanoBananaUsage.remainingFree > 0 && (
              <span className="text-green-600 ml-2">
                ({nanoBananaUsage.remainingFree} remaining)
              </span>
            )}
          </div>
          <Button 
            onClick={handleGenerateVariations}
            disabled={!selectedAd || isGenerating || nanoBananaUsage.remainingFree < 5}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Variations'}
          </Button>
        </div>
      </div>

      {/* Ad Type Indicator */}
      {selectedAd && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="default" className="px-3 py-1">
                  {selectedAd.ad_type === 'call' ? '📞 Call Ad' : '🎯 Standard Ad'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedAd.ad_type === 'call'
                    ? 'Optimized for phone calls and direct contact'
                    : 'Optimized for clicks and conversions'}
                </span>
              </div>
              {selectedAd.phone_number && (
                <div className="text-sm font-mono bg-background px-3 py-1 rounded">
                  📞 {selectedAd.phone_number}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variation Types Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {variationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{type.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className={type.color}>
                    {variationTypes.findIndex(v => v.id === type.id) + 1}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                  <div className="space-y-1">
                    {type.examples.map((example, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ad Selection */}
      {clientAds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Ad for Variation</CardTitle>
            <CardDescription>
              Choose an ad to generate 5 ROAS-optimized variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {clientAds.map((ad) => (
                <div
                  key={ad.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAd?.id === ad.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="flex items-start space-x-4">
                    {ad.image_url && (
                      <img 
                        src={ad.image_url} 
                        alt={ad.headline}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{ad.headline}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ad.description?.substring(0, 100)}...
                      </p>
                      {ad.engagement_score && (
                        <Badge variant="outline" className="mt-2">
                          Engagement: {ad.engagement_score}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Variations */}
      {generatedVariations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Variations</CardTitle>
            <CardDescription>
              5 ROAS-optimized variations ranked by conversion potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {generatedVariations.map((variation, index) => (
                <div key={variation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Badge className={getROASBadgeColor(variation.roas_score)}>
                        ROAS: {variation.roas_score}/100
                      </Badge>
                      <Badge variant="secondary">
                        {variation.variation_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      CTR: {variation.predicted_ctr}% | Conv: {variation.predicted_conversion_rate}%
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">{variation.headline}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {variation.primary_text}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          {variation.call_to_action}
                        </Button>
                        {variation.phone_number && (
                          <Badge variant="secondary" className="font-mono">
                            📞 {variation.phone_number}
                          </Badge>
                        )}
                      </div>
                      {variation.call_script && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong>Call Script:</strong> {variation.call_script}
                        </div>
                      )}
                    </div>
                    
                    {variation.image_url && (
                      <div>
                        <img 
                          src={variation.image_url} 
                          alt={variation.headline}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  {variation.description && (
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <strong>Strategy:</strong> {variation.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Ads State */}
      {clientAds.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ads available for variations</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Import some high-performing ads first, then return here to generate 
              5 ROAS-optimized variations for each ad.
            </p>
            <Button variant="outline">
              Go to Ad Library
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};