import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const DebugPanel: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'success' | 'error' | 'idle'>('idle');
  const [apiResponse, setApiResponse] = useState<any>(null);

  const testApiConnection = async () => {
    setApiStatus('checking');
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      setApiResponse(data);
      setApiStatus('success');
    } catch (error) {
      setApiResponse({ error: error.message });
      setApiStatus('error');
    }
  };

  const testClientCreation = async () => {
    setApiStatus('checking');
    try {
      const testClient = {
        name: 'Debug Test Client',
        industry: 'ecommerce',
        target_roas: 4.0,
        website: 'https://debug-test.com'
      };

      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testClient)
      });

      const data = await response.json();
      setApiResponse(data);
      setApiStatus('success');
    } catch (error) {
      setApiResponse({ error: error.message });
      setApiStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 API Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testApiConnection} 
            disabled={apiStatus === 'checking'}
            variant="outline"
          >
            {apiStatus === 'checking' ? 'Testing...' : 'Test API Health'}
          </Button>
          
          <Button 
            onClick={testClientCreation} 
            disabled={apiStatus === 'checking'}
            variant="outline"
          >
            {apiStatus === 'checking' ? 'Testing...' : 'Test Client Creation'}
          </Button>
        </div>

        {apiStatus !== 'idle' && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={
                apiStatus === 'success' ? 'default' : 
                apiStatus === 'error' ? 'destructive' : 
                'secondary'
              }>
                {apiStatus === 'success' ? '✅ Success' : 
                 apiStatus === 'error' ? '❌ Error' : 
                 '🔄 Checking...'}
              </Badge>
            </div>
            
            {apiResponse && (
              <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Frontend:</strong> http://localhost:3000</p>
          <p><strong>Backend:</strong> http://localhost:3001</p>
          <p><strong>API Base:</strong> http://localhost:3001/api</p>
        </div>
      </CardContent>
    </Card>
  );
};