export interface Client {
  id: number;
  name: string;
  industry?: string;
  target_roas: number;
  avg_order_value?: number;
  created_at: string;
  updated_at: string;
}

export interface Ad {
  id: number;
  client_id: number;
  ad_url?: string;
  ad_platform: string;
  headline: string;
  description: string;
  cta_text?: string;
  image_url?: string;
  video_url?: string;
  engagement_score: number;
  estimated_spend: number;
  ad_longevity_days: number;
  performance_indicators: Record<string, any>;
  scraped_at: string;
  created_at: string;
  variations?: AdVariation[];
}

export interface AdVariation {
  id: number;
  original_ad_id: number;
  variation_type: 'urgency' | 'social_proof' | 'benefit' | 'problem_agitation' | 'offer';
  headline: string;
  description: string;
  cta_text?: string;
  image_url?: string;
  roas_prediction_score: number;
  conversion_elements: Record<string, any>;
  created_at: string;
}

export interface PerformanceTracking {
  id: number;
  variation_id: number;
  actual_roas?: number;
  actual_ctr?: number;
  actual_conversion_rate?: number;
  actual_cpa?: number;
  spend_amount?: number;
  campaign_duration_days?: number;
  notes?: string;
  tracked_at: string;
}

export interface ROASPattern {
  id: number;
  industry: string;
  variation_type: string;
  element_type: string;
  element_value: string;
  avg_roas: number;
  success_count: number;
  total_tests: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface NanoBananaUsage {
  dailyImageCount: number;
  dailyLimit: number;
  remainingFree: number;
  costPerAdditional: number;
  estimatedCostToday: number;
}