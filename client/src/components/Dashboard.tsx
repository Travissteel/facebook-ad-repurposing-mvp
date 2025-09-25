import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSelector } from './ClientSelector';
import { AdLibrary } from './AdLibrary';
import { VariationStudio } from './VariationStudio';
import { PerformanceDashboard } from './PerformanceDashboard';
import { ScrapingInterface } from './ScrapingInterface';
import { DebugPanel } from './DebugPanel';
import { useClient } from '../context/ClientContext';
import { 
  BarChart3, 
  Search, 
  Palette, 
  TrendingUp, 
  Users,
  Target,
  DollarSign
} from 'lucide-react';

type DashboardView = 'overview' | 'library' | 'scraping' | 'studio' | 'performance' | 'debug';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const { selectedClient } = useClient();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'debug', label: 'Debug API', icon: Target },
    { id: 'scraping', label: 'Ad Scraping', icon: Search },
    { id: 'library', label: 'Ad Library', icon: Users },
    { id: 'studio', label: 'Variation Studio', icon: Palette },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">
                Facebook Ad Repurposer
              </h1>
              <Badge variant="secondary" className="text-xs">
                ROAS-Focused MVP
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <ClientSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? 'default' : 'ghost'}
                  className="flex items-center space-x-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  onClick={() => setActiveView(item.id as DashboardView)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!selectedClient ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Facebook Ad Repurposer</CardTitle>
              <CardDescription>
                Please select or create a client to get started with ROAS-focused ad variations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tool helps you generate high-converting Facebook ad variations based on proven ROAS patterns.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Client Info Bar */}
            <div className="mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h2 className="text-lg font-semibold">{selectedClient.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedClient.industry || 'No industry specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Target ROAS</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {selectedClient.target_roas}x
                        </p>
                      </div>
                      
                      {selectedClient.avg_order_value && (
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">AOV</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            ${selectedClient.avg_order_value}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View Content */}
            {activeView === 'overview' && <OverviewDashboard />}
            {activeView === 'debug' && (
              <div className="flex justify-center">
                <DebugPanel />
              </div>
            )}
            {activeView === 'scraping' && <ScrapingInterface />}
            {activeView === 'library' && <AdLibrary />}
            {activeView === 'studio' && <VariationStudio />}
            {activeView === 'performance' && <PerformanceDashboard />}
          </>
        )}
      </main>
    </div>
  );
};

const OverviewDashboard: React.FC = () => {
  const { selectedClient } = useClient();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No ads imported yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variations Generated</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              5 per ad maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg ROAS Prediction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Target: {selectedClient?.target_roas}x
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nano Banana Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/100</div>
            <p className="text-xs text-muted-foreground">
              Free daily images
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your ROAS-focused ad variations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Scrape High-Performance Ads
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Upload Existing Ads
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Palette className="mr-2 h-4 w-4" />
              Create Variations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROAS Methodology</CardTitle>
            <CardDescription>
              Our 5-variation system focuses on conversion optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="roas-excellent">1</Badge>
                <span className="text-sm">Urgency-focused (scarcity, time limits)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="roas-good">2</Badge>
                <span className="text-sm">Social proof-heavy (testimonials, reviews)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="roas-average">3</Badge>
                <span className="text-sm">Benefit-driven (outcomes, transformations)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="roas-poor">4</Badge>
                <span className="text-sm">Problem-agitation (pain point focus)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="roas-excellent">5</Badge>
                <span className="text-sm">Offer-optimized (pricing, guarantees)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};