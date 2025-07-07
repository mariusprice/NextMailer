export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      email_lists: {
        Row: {
          id: string
          name: string
          description: string | null
          subscriber_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          subscriber_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          subscriber_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          id: string
          email_list_id: string
          email: string
          first_name: string | null
          last_name: string | null
          status: string
          subscribed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email_list_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          status?: string
          subscribed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email_list_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          status?: string
          subscribed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_email_list_id_fkey"
            columns: ["email_list_id"]
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          email_list_id: string
          name: string
          subject: string
          content: string
          template_id: string | null
          status: string
          sent_at: string | null
          recipient_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email_list_id: string
          name: string
          subject: string
          content: string
          template_id?: string | null
          status?: string
          sent_at?: string | null
          recipient_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email_list_id?: string
          name?: string
          subject?: string
          content?: string
          template_id?: string | null
          status?: string
          sent_at?: string | null
          recipient_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_email_list_id_fkey"
            columns: ["email_list_id"]
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_analytics: {
        Row: {
          id: string
          campaign_id: string
          subscriber_id: string
          event_type: string
          event_data: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          campaign_id: string
          subscriber_id: string
          event_type: string
          event_data?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          subscriber_id?: string
          event_type?: string
          event_data?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_analytics_subscriber_id_fkey"
            columns: ["subscriber_id"]
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier use
export type EmailList = Database['public']['Tables']['email_lists']['Row']
export type Subscriber = Database['public']['Tables']['subscribers']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignAnalytics = Database['public']['Tables']['campaign_analytics']['Row']

export type NewEmailList = Database['public']['Tables']['email_lists']['Insert']
export type NewSubscriber = Database['public']['Tables']['subscribers']['Insert']
export type NewCampaign = Database['public']['Tables']['campaigns']['Insert']
export type NewCampaignAnalytics = Database['public']['Tables']['campaign_analytics']['Insert']

export type UpdateEmailList = Database['public']['Tables']['email_lists']['Update']
export type UpdateSubscriber = Database['public']['Tables']['subscribers']['Update']
export type UpdateCampaign = Database['public']['Tables']['campaigns']['Update']
export type UpdateCampaignAnalytics = Database['public']['Tables']['campaign_analytics']['Update']

// Campaign statuses
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed'

// Subscriber statuses
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced'

// Analytics event types
export type AnalyticsEventType = 'sent' | 'delivered' | 'bounced' | 'complaint' | 'opened' | 'clicked'

// Email templates
export type EmailTemplate = 'newsletter' | 'promotional' | 'welcome' 