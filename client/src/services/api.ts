import axios from 'axios';
import type { Client, Ad, AdVariation, ApiResponse, NanoBananaUsage } from '../types';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data || error.message,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await api.get('/clients');
    return response.data as Client[];
  },

  async getById(id: number): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data as Client;
  },

  async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const response = await api.post('/clients', client);
    return response.data as Client;
  },

  async update(id: number, client: Partial<Client>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, client);
    return response.data as Client;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async getAds(id: number): Promise<Ad[]> {
    const response = await api.get(`/clients/${id}/ads`);
    return response.data as Ad[];
  },

  async getPerformance(id: number): Promise<any> {
    const response = await api.get(`/clients/${id}/performance`);
    return response.data;
  },
};

export const adService = {
  async getAll(params?: { client_id?: number; limit?: number; offset?: number }): Promise<Ad[]> {
    const response = await api.get('/ads', { params });
    return response.data as Ad[];
  },

  async getById(id: number): Promise<Ad> {
    const response = await api.get(`/ads/${id}`);
    return response.data as Ad;
  },

  async create(ad: Omit<Ad, 'id' | 'created_at' | 'scraped_at'>): Promise<Ad> {
    const response = await api.post('/ads', ad);
    return response.data as Ad;
  },

  async update(id: number, ad: Partial<Ad>): Promise<Ad> {
    const response = await api.put(`/ads/${id}`, ad);
    return response.data as Ad;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/ads/${id}`);
  },

  async getHighPerforming(params?: { 
    industry?: string; 
    min_engagement?: number; 
    limit?: number; 
  }): Promise<Ad[]> {
    const response = await api.get('/ads/high-performance/list', { params });
    return response.data as Ad[];
  },

  async bulkImport(client_id: number, ads: any[]): Promise<ApiResponse<any>> {
    const response = await api.post('/ads/bulk-import', { client_id, ads });
    return response.data as ApiResponse<any>;
  },
};

export const variationService = {
  async generate(adId: number, variationTypes: string[]): Promise<AdVariation[]> {
    const response = await api.post('/variations/generate', {
      adId,
      variationTypes
    });
    return response.data as AdVariation[];
  },

  async getByAdId(adId: number): Promise<AdVariation[]> {
    const response = await api.get(`/variations/ad/${adId}`);
    return response.data as AdVariation[];
  },

  async update(id: number, variation: Partial<AdVariation>): Promise<AdVariation> {
    const response = await api.put(`/variations/${id}`, variation);
    return response.data as AdVariation;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/variations/${id}`);
  },

  async export(variationIds: number[], format: 'csv' | 'facebook'): Promise<Blob> {
    const response = await api.post(`/variations/export/${format}`, 
      { variationIds }, 
      { responseType: 'blob' }
    );
    return response.data as Blob;
  },
};

export const scraperService = {
  async scrapeAds(params: {
    searchTerm: string;
    country?: string;
    maxAds?: number;
    industry?: string;
    minEngagement?: number;
  }): Promise<Ad[]> {
    const response = await api.post('/scraper/facebook', params);
    return response.data as Ad[];
  },

  async getStatus(): Promise<{ running: boolean; progress?: number; message?: string }> {
    const response = await api.get('/scraper/status');
    return response.data as { running: boolean; progress?: number; message?: string };
  },

  async getMCPStatus(): Promise<{
    isInitialized: boolean;
    mockMode: boolean;
    mcpType: 'hosted' | 'local';
    hasApiToken: boolean;
    availableActors: Array<{
      id: string;
      name: string;
      description: string;
      stats: any;
      isWorking: boolean;
    }>;
    capabilities: {
      dynamicActorDiscovery: boolean;
      fallbackToMock: boolean;
      actorCount: number;
    };
  }> {
    const response = await api.get('/scraper/mcp-status');
    return response.data;
  },
};

export const nanoBananaService = {
  async getUsage(): Promise<NanoBananaUsage> {
    const response = await api.get('/nano-banana/usage');
    return response.data as NanoBananaUsage;
  },

  async generateVariations(adId: number, clientId: number): Promise<{
    variations: AdVariation[];
    dailyUsage: number;
    remainingFree: number;
  }> {
    const response = await api.post('/nano-banana/generate-variations', {
      adId,
      clientId
    });
    return response.data;
  },

  async generateImage(params: {
    prompt: string;
    baseImageUrl?: string;
  }): Promise<{
    imageUrl: string;
    dailyUsage: number;
    remainingFree: number;
  }> {
    const response = await api.post('/nano-banana/generate-image', params);
    return response.data;
  },
};

export default api;