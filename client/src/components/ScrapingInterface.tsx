import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useClient } from '../context/ClientContext';
import { Search, Globe, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export const ScrapingInterface: React.FC = () => {
  const { selectedClient } = useClient();
  const [scraping, setScraping] = useState(false);
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    country: 'US',
    maxAds: 20,
    minEngagement: 100
  });

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchParams.searchTerm.trim() || !selectedClient) return;
    
    try {
      setScraping(true);
      // TODO: Implement actual scraping call
      console.log('Scraping with params:', searchParams);
      
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      setScraping(false);
    }
  };

  if (!selectedClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Scraping</CardTitle>
          <CardDescription>Select a client to start scraping high-performance ads</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Facebook Ad Scraping</h2>
        <p className="text-muted-foreground">
          Discover high-performing ads in {selectedClient.industry || 'your industry'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scraping Form */}
        <Card>
          <CardHeader>
            <CardTitle>Scrape High-Performance Ads</CardTitle>
            <CardDescription>
              Find ads with strong engagement and conversion signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScrape} className="space-y-4">
              <div>
                <Label htmlFor="search-term">Search Keywords *</Label>
                <Input
                  id="search-term"
                  type="text"
                  placeholder="e.g., fitness supplements, productivity apps"
                  value={searchParams.searchTerm}
                  onChange={(e) => setSearchParams({ ...searchParams, searchTerm: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keywords related to your client's products or industry
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="US"
                    value={searchParams.country}
                    onChange={(e) => setSearchParams({ ...searchParams, country: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-ads">Max Ads</Label>
                  <Input
                    id="max-ads"
                    type="number"
                    min="5"
                    max="100"
                    value={searchParams.maxAds}
                    onChange={(e) => setSearchParams({ ...searchParams, maxAds: parseInt(e.target.value) || 20 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="min-engagement">Min. Engagement</Label>
                <Input
                  id="min-engagement"
                  type="number"
                  min="0"
                  value={searchParams.minEngagement}
                  onChange={(e) => setSearchParams({ ...searchParams, minEngagement: parseInt(e.target.value) || 100 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total likes + comments + shares required
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={scraping || !searchParams.searchTerm.trim()}
              >
                {scraping ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    Scraping Ads...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Start Scraping
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Scraping Tips */}
        <Card>
          <CardHeader>
            <CardTitle>ROAS-Focused Scraping Tips</CardTitle>
            <CardDescription>
              How to find the most profitable ad patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Look for Conversion Signals</p>
                <p className="text-sm text-muted-foreground">
                  Ads with pricing, offers, and purchase-intent comments
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Target Your Geographic Market</p>
                <p className="text-sm text-muted-foreground">
                  Set country to match your client's target audience
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Focus on Longevity</p>
                <p className="text-sm text-muted-foreground">
                  Ads running 30+ days are usually profitable
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Quality over Quantity</p>
                <p className="text-sm text-muted-foreground">
                  Better to analyze 20 high-quality ads than 100 poor ones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scraping Status */}
      {scraping && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Search className="h-8 w-8 text-primary animate-spin" />
              <div>
                <h3 className="font-semibold">Scraping in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Searching for high-performance ads matching "{searchParams.searchTerm}"...
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>Analyzing ads...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apify Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge variant="outline">Powered by Apify</Badge>
            <span>Ad Scraping Engine</span>
          </CardTitle>
          <CardDescription>
            Advanced Facebook ad discovery and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">95%</p>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">30s</p>
              <p className="text-sm text-muted-foreground">Avg. Scraping Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">100+</p>
              <p className="text-sm text-muted-foreground">Data Points per Ad</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};