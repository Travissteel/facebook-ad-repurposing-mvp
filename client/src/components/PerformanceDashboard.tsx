import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClient } from '../context/ClientContext';
import { TrendingUp, DollarSign, Target, BarChart3, Activity } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { selectedClient } = useClient();

  if (!selectedClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Dashboard</CardTitle>
          <CardDescription>Select a client to view performance analytics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <p className="text-muted-foreground">
          ROAS tracking and analytics for {selectedClient.name}
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Target: {selectedClient.target_roas}x
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              No campaigns tracked yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performing Variation</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No variations tested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Prediction vs actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variation Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Variation Performance by Type</CardTitle>
          <CardDescription>
            How each variation type performs for your industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Urgency-Focused', roas: '--', tests: 0, color: 'roas-excellent' },
              { type: 'Social Proof', roas: '--', tests: 0, color: 'roas-good' },
              { type: 'Benefit-Driven', roas: '--', tests: 0, color: 'roas-average' },
              { type: 'Problem Agitation', roas: '--', tests: 0, color: 'roas-poor' },
              { type: 'Offer-Optimized', roas: '--', tests: 0, color: 'roas-excellent' }
            ].map((variation, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={variation.color}>
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{variation.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {variation.tests} tests completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{variation.roas}</p>
                  <p className="text-xs text-muted-foreground">Avg ROAS</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call-Specific Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📞 Call Performance Metrics</span>
            <Badge variant="secondary">Call Ads</Badge>
          </CardTitle>
          <CardDescription>
            Track phone call performance and cost-per-call efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cost Per Call</p>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">No call data yet</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Qualified Calls</p>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">--% quality rate</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Call → Sale Rate</p>
              <div className="text-2xl font-bold">--%</div>
              <p className="text-xs text-muted-foreground">No conversions tracked</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">🔥 Call Ad Best Practices</h4>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="font-medium text-primary mb-2">Lower Cost Per Call:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Use urgency CTAs ("Call Now", "Today Only")</li>
                  <li>• Target business hours for higher quality</li>
                  <li>• Add local area codes for trust</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-primary mb-2">Higher Conversion:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Offer free consultations</li>
                  <li>• Use social proof ("10,000+ calls answered")</li>
                  <li>• Highlight immediate availability</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Data State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No performance data yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Start by creating ad variations (including call ads) and tracking their performance
            to see detailed ROAS analytics and cost-per-call optimization insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};