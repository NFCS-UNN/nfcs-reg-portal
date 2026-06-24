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
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          address: string | null;
          role: 'student' | 'alumnus' | 'exco' | 'super_admin';
          status: 'pending' | 'active' | 'suspended' | 'legacy';
          organ: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          society: string | null;
          parish: string | null;
          faculty: string | null;
          department: string | null;
          matric_number: string | null;
          academic_level: string | null;
          passport_photo_url: string | null;
          is_legacy: boolean | null;
          legacy_id: string | null;
          claimed_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          role?: 'student' | 'alumnus' | 'exco' | 'super_admin';
          status?: 'pending' | 'active' | 'suspended' | 'legacy';
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          society?: string | null;
          parish?: string | null;
          faculty?: string | null;
          department?: string | null;
          matric_number?: string | null;
          academic_level?: string | null;
          passport_photo_url?: string | null;
          is_legacy?: boolean | null;
          legacy_id?: string | null;
          claimed_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          role?: 'student' | 'alumnus' | 'exco' | 'super_admin';
          status?: 'pending' | 'active' | 'suspended' | 'legacy';
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          society?: string | null;
          parish?: string | null;
          faculty?: string | null;
          department?: string | null;
          matric_number?: string | null;
          academic_level?: string | null;
          passport_photo_url?: string | null;
          is_legacy?: boolean | null;
          legacy_id?: string | null;
          claimed_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      legacy_members: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          matric_number: string | null;
          faculty: string | null;
          department: string | null;
          academic_level: string | null;
          organ: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          society: string | null;
          parish: string | null;
          address: string | null;
          role: 'student' | 'alumnus' | 'exco' | 'super_admin';
          migration_source: 'notebook' | 'dues_card' | 'csv_import' | 'manual_entry';
          migrated_by: string | null;
          notes: string | null;
          claim_status: 'unclaimed' | 'invited' | 'claimed' | null;
          claim_token: string | null;
          claim_token_expires: string | null;
          claimed_by_profile: string | null;
          dues_imported: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          matric_number?: string | null;
          faculty?: string | null;
          department?: string | null;
          academic_level?: string | null;
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          society?: string | null;
          parish?: string | null;
          address?: string | null;
          role?: 'student' | 'alumnus' | 'exco' | 'super_admin';
          migration_source: 'notebook' | 'dues_card' | 'csv_import' | 'manual_entry';
          migrated_by?: string | null;
          notes?: string | null;
          claim_status?: 'unclaimed' | 'invited' | 'claimed' | null;
          claim_token?: string | null;
          claim_token_expires?: string | null;
          claimed_by_profile?: string | null;
          dues_imported?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          matric_number?: string | null;
          faculty?: string | null;
          department?: string | null;
          academic_level?: string | null;
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          society?: string | null;
          parish?: string | null;
          address?: string | null;
          role?: 'student' | 'alumnus' | 'exco' | 'super_admin';
          migration_source?: 'notebook' | 'dues_card' | 'csv_import' | 'manual_entry';
          migrated_by?: string | null;
          notes?: string | null;
          claim_status?: 'unclaimed' | 'invited' | 'claimed' | null;
          claim_token?: string | null;
          claim_token_expires?: string | null;
          claimed_by_profile?: string | null;
          dues_imported?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          profile_id: string | null;
          legacy_member_id: string | null;
          amount: number;
          dues_type: 'membership_levy' | 'annual_dues' | 'special_levy' | 'other';
          channel: 'online' | 'manual';
          status: 'pending' | 'confirmed' | 'failed' | 'reversed';
          payment_reference: string | null;
          gateway: string | null;
          gateway_response: Json | null;
          payment_period: string | null;
          recorded_by: string | null;
          receipt_number: string | null;
          payment_date: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          legacy_member_id?: string | null;
          amount: number;
          dues_type?: 'membership_levy' | 'annual_dues' | 'special_levy' | 'other';
          channel: 'online' | 'manual';
          status?: 'pending' | 'confirmed' | 'failed' | 'reversed';
          payment_reference?: string | null;
          gateway?: string | null;
          gateway_response?: Json | null;
          payment_period?: string | null;
          recorded_by?: string | null;
          receipt_number?: string | null;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          legacy_member_id?: string | null;
          amount?: number;
          dues_type?: 'membership_levy' | 'annual_dues' | 'special_levy' | 'other';
          channel?: 'online' | 'manual';
          status?: 'pending' | 'confirmed' | 'failed' | 'reversed';
          payment_reference?: string | null;
          gateway?: string | null;
          gateway_response?: Json | null;
          payment_period?: string | null;
          recorded_by?: string | null;
          receipt_number?: string | null;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_type: string | null;
          organ: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          is_published: boolean | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_type?: string | null;
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          is_published?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_type?: string | null;
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          location?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          is_published?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          organ: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          is_published: boolean | null;
          published_at: string | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          is_published?: boolean | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          organ?: 'gospel_band' | 'evangelical_committee' | 'federation_theater' | 'social_communications_commission' | 'discipline_committee' | null;
          is_published?: boolean | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
      };
    };
  };
}
