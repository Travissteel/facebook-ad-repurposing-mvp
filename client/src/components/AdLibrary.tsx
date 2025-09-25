import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClient } from '../context/ClientContext';
import { Upload, FileText, ExternalLink } from 'lucide-react';

export const AdLibrary: React.FC = () => {
  const { selectedClient } = useClient();

  if (!selectedClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Library</CardTitle>
          <CardDescription>Select a client to view their ad library</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ad Library</h2>
          <p className="text-muted-foreground">
            Manage and analyze ads for {selectedClient.name}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Ads
          </Button>
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Import from URL
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No ads imported yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Import high-performing ads to start generating ROAS-focused variations. 
            You can upload existing ads or scrape them from Facebook.
          </p>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Button>
              Start Scraping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};