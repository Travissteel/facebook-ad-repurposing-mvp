import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClient } from '../context/ClientContext';
import { clientService } from '../services/api';
import { Plus, Building } from 'lucide-react';

export const ClientSelector: React.FC = () => {
  const { clients, selectedClient, setSelectedClient, refreshClients, loading } = useClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    target_roas: 3.0,
    avg_order_value: 0
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClient.name.trim()) return;
    
    try {
      setCreating(true);
      const client = await clientService.create({
        name: newClient.name,
        industry: newClient.industry || undefined,
        target_roas: newClient.target_roas,
        avg_order_value: newClient.avg_order_value || undefined
      });
      
      await refreshClients();
      setSelectedClient(client);
      setShowCreateForm(false);
      setNewClient({
        name: '',
        industry: '',
        target_roas: 3.0,
        avg_order_value: 0
      });
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading clients...</div>;
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Client Selector */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="client-select" className="text-sm font-medium">
          Client:
        </Label>
        <Select
          value={selectedClient?.id.toString() || ''}
          onValueChange={(value) => {
            const client = clients.find(c => c.id.toString() === value);
            setSelectedClient(client || null);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{client.name}</span>
                  {client.industry && (
                    <Badge variant="outline" className="text-xs">
                      {client.industry}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Create Client Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCreateForm(true)}
        className="flex items-center space-x-1"
      >
        <Plus className="h-4 w-4" />
        <span>New Client</span>
      </Button>

      {/* Create Client Modal/Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Client</CardTitle>
              <CardDescription>
                Add a new client to start generating ROAS-focused ad variations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Client Name *</Label>
                  <Input
                    id="client-name"
                    type="text"
                    placeholder="Enter client name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="client-industry">Industry</Label>
                  <Input
                    id="client-industry"
                    type="text"
                    placeholder="e.g., E-commerce, SaaS, Health"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="target-roas">Target ROAS</Label>
                  <Input
                    id="target-roas"
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="3.0"
                    value={newClient.target_roas}
                    onChange={(e) => setNewClient({ ...newClient, target_roas: parseFloat(e.target.value) || 3.0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="avg-order-value">Average Order Value ($)</Label>
                  <Input
                    id="avg-order-value"
                    type="number"
                    min="0"
                    placeholder="100"
                    value={newClient.avg_order_value}
                    onChange={(e) => setNewClient({ ...newClient, avg_order_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || !newClient.name.trim()}>
                    {creating ? 'Creating...' : 'Create Client'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};