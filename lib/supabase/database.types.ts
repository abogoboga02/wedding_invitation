import type {
  GuestSource,
  InvitationStatus,
  InvitationTemplate,
  PaymentStatus,
  PlanTier,
  RsvpStatus,
  SendChannel,
  SendLogStatus,
  SubscriptionStatus,
  UserRole,
} from "@/lib/domain/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          owner_id: string;
          template: InvitationTemplate;
          template_name: string | null;
          template_schema: Json | null;
          status: InvitationStatus;
          couple_slug: string;
          partner_one_name: string;
          partner_two_name: string;
          headline: string;
          subheadline: string;
          story: string;
          closing_note: string;
          template_config: Json | null;
          cover_image_url: string | null;
          cover_image_alt: string | null;
          cover_image_storage_path: string | null;
          music_url: string | null;
          music_original_name: string | null;
          music_mime_type: string | null;
          music_size: number | null;
          music_storage_path: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          template?: InvitationTemplate;
          template_name?: string | null;
          template_schema?: Json | null;
          status?: InvitationStatus;
          couple_slug: string;
          partner_one_name: string;
          partner_two_name: string;
          headline: string;
          subheadline: string;
          story: string;
          closing_note: string;
          template_config?: Json | null;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          cover_image_storage_path?: string | null;
          music_url?: string | null;
          music_original_name?: string | null;
          music_mime_type?: string | null;
          music_size?: number | null;
          music_storage_path?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          template?: InvitationTemplate;
          template_name?: string | null;
          template_schema?: Json | null;
          status?: InvitationStatus;
          couple_slug?: string;
          partner_one_name?: string;
          partner_two_name?: string;
          headline?: string;
          subheadline?: string;
          story?: string;
          closing_note?: string;
          template_config?: Json | null;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          cover_image_storage_path?: string | null;
          music_url?: string | null;
          music_original_name?: string | null;
          music_mime_type?: string | null;
          music_size?: number | null;
          music_storage_path?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_slots: {
        Row: {
          id: string;
          invitation_id: string;
          label: string;
          starts_at: string;
          venue_name: string;
          address: string;
          maps_url: string | null;
          latitude: number | null;
          longitude: number | null;
          place_name: string | null;
          formatted_address: string | null;
          google_maps_url: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          label: string;
          starts_at: string;
          venue_name: string;
          address: string;
          maps_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          place_name?: string | null;
          formatted_address?: string | null;
          google_maps_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          label?: string;
          starts_at?: string;
          venue_name?: string;
          address?: string;
          maps_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          place_name?: string | null;
          formatted_address?: string | null;
          google_maps_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          invitation_id: string;
          image_url: string;
          storage_path: string | null;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          image_url: string;
          storage_path?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          image_url?: string;
          storage_path?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          invitation_id: string;
          name: string;
          guest_slug: string;
          phone: string | null;
          email: string | null;
          source: GuestSource;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          name: string;
          guest_slug: string;
          phone?: string | null;
          email?: string | null;
          source?: GuestSource;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          name?: string;
          guest_slug?: string;
          phone?: string | null;
          email?: string | null;
          source?: GuestSource;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          guest_id: string;
          respondent_name: string | null;
          status: RsvpStatus;
          attendees: number;
          note: string | null;
          responded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          respondent_name?: string | null;
          status: RsvpStatus;
          attendees?: number;
          note?: string | null;
          responded_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string;
          respondent_name?: string | null;
          status?: RsvpStatus;
          attendees?: number;
          note?: string | null;
          responded_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishes: {
        Row: {
          id: string;
          invitation_id: string;
          guest_id: string;
          message: string;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_id: string;
          message: string;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          guest_id?: string;
          message?: string;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitation_view_logs: {
        Row: {
          id: string;
          invitation_id: string;
          guest_id: string;
          path: string | null;
          opened_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_id: string;
          path?: string | null;
          opened_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          guest_id?: string;
          path?: string | null;
          opened_at?: string;
        };
        Relationships: [];
      };
      invitation_settings: {
        Row: {
          id: string;
          invitation_id: string;
          locale: string;
          timezone: string;
          is_rsvp_enabled: boolean;
          is_wish_enabled: boolean;
          auto_play_music: boolean;
          preferred_send_channel: SendChannel;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          locale?: string;
          timezone?: string;
          is_rsvp_enabled?: boolean;
          is_wish_enabled?: boolean;
          auto_play_music?: boolean;
          preferred_send_channel?: SendChannel;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          locale?: string;
          timezone?: string;
          is_rsvp_enabled?: boolean;
          is_wish_enabled?: boolean;
          auto_play_music?: boolean;
          preferred_send_channel?: SendChannel;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          tier: PlanTier;
          name: string;
          description: string;
          price_in_idr: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tier: PlanTier;
          name: string;
          description: string;
          price_in_idr: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tier?: PlanTier;
          name?: string;
          description?: string;
          price_in_idr?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: SubscriptionStatus;
          starts_at: string;
          expires_at: string | null;
          auto_renew: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: SubscriptionStatus;
          starts_at?: string;
          expires_at?: string | null;
          auto_renew?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: SubscriptionStatus;
          starts_at?: string;
          expires_at?: string | null;
          auto_renew?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_orders: {
        Row: {
          id: string;
          user_id: string;
          invitation_id: string | null;
          plan_id: string | null;
          status: PaymentStatus;
          amount_in_idr: number;
          currency: string;
          provider: string | null;
          external_reference: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invitation_id?: string | null;
          plan_id?: string | null;
          status?: PaymentStatus;
          amount_in_idr: number;
          currency?: string;
          provider?: string | null;
          external_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invitation_id?: string | null;
          plan_id?: string | null;
          status?: PaymentStatus;
          amount_in_idr?: number;
          currency?: string;
          provider?: string | null;
          external_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      send_logs: {
        Row: {
          id: string;
          invitation_id: string;
          guest_id: string | null;
          channel: SendChannel;
          status: SendLogStatus;
          recipient: string;
          provider: string | null;
          provider_message_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_id?: string | null;
          channel?: SendChannel;
          status?: SendLogStatus;
          recipient: string;
          provider?: string | null;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          guest_id?: string | null;
          channel?: SendChannel;
          status?: SendLogStatus;
          recipient?: string;
          provider?: string | null;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];
export type TableName = keyof PublicSchema["Tables"];
export type TableRow<T extends TableName> = PublicSchema["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"];
