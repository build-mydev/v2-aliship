export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_no: string
          active: boolean
          balance: number
          company: string
          contact_name: string | null
          created_at: string
          id: string
          phone: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
        }
        Insert: {
          account_no: string
          active?: boolean
          balance?: number
          company: string
          contact_name?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Update: {
          account_no?: string
          active?: boolean
          balance?: number
          company?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          from_state: string | null
          id: string
          impersonated: boolean
          impersonator_id: string | null
          metadata: Json | null
          site_id: string | null
          to_state: string | null
          waybill: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          from_state?: string | null
          id?: string
          impersonated?: boolean
          impersonator_id?: string | null
          metadata?: Json | null
          site_id?: string | null
          to_state?: string | null
          waybill?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          from_state?: string | null
          id?: string
          impersonated?: boolean
          impersonator_id?: string | null
          metadata?: Json | null
          site_id?: string | null
          to_state?: string | null
          waybill?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      bag_parcels: {
        Row: {
          bag_id: string
          created_at: string
          id: string
          parcel_id: string
        }
        Insert: {
          bag_id: string
          created_at?: string
          id?: string
          parcel_id: string
        }
        Update: {
          bag_id?: string
          created_at?: string
          id?: string
          parcel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bag_parcels_bag_id_fkey"
            columns: ["bag_id"]
            isOneToOne: false
            referencedRelation: "bags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bag_parcels_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      bags: {
        Row: {
          account_id: string | null
          bag_number: string
          created_at: string
          created_by: string | null
          id: string
          manifest_id: string | null
          origin_site_id: string | null
          parcel_count: number
          total_freight: number
        }
        Insert: {
          account_id?: string | null
          bag_number: string
          created_at?: string
          created_by?: string | null
          id?: string
          manifest_id?: string | null
          origin_site_id?: string | null
          parcel_count?: number
          total_freight?: number
        }
        Update: {
          account_id?: string | null
          bag_number?: string
          created_at?: string
          created_by?: string | null
          id?: string
          manifest_id?: string | null
          origin_site_id?: string | null
          parcel_count?: number
          total_freight?: number
        }
        Relationships: [
          {
            foreignKeyName: "bags_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bags_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "manifests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bags_origin_site_id_fkey"
            columns: ["origin_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_reports: {
        Row: {
          created_at: string
          id: string
          notes: string
          parcel_id: string
          photo_path: string | null
          reported_by: string | null
          site_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes: string
          parcel_id: string
          photo_path?: string | null
          reported_by?: string | null
          site_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          parcel_id?: string
          photo_path?: string | null
          reported_by?: string | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string
          id: string
          notes: string | null
          outcome: string
          parcel_id: string
          rider_id: string | null
          scheduled_date: string | null
        }
        Insert: {
          attempt_number: number
          attempted_at?: string
          id?: string
          notes?: string | null
          outcome: string
          parcel_id: string
          rider_id?: string | null
          scheduled_date?: string | null
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          id?: string
          notes?: string | null
          outcome?: string
          parcel_id?: string
          rider_id?: string | null
          scheduled_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_attempts_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      door_to_door_rates: {
        Row: {
          active: boolean
          created_at: string
          id: string
          rate_0_5km: number
          rate_10_20km: number
          rate_5_10km: number
          rate_above_20km: number
          updated_at: string
          weight_max: number
          weight_min: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          rate_0_5km?: number
          rate_10_20km?: number
          rate_5_10km?: number
          rate_above_20km?: number
          updated_at?: string
          weight_max: number
          weight_min: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          rate_0_5km?: number
          rate_10_20km?: number
          rate_5_10km?: number
          rate_above_20km?: number
          updated_at?: string
          weight_max?: number
          weight_min?: number
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_internal: boolean
          name: string
          phone: string
          vehicle_reg: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_internal?: boolean
          name: string
          phone: string
          vehicle_reg?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_internal?: boolean
          name?: string
          phone?: string
          vehicle_reg?: string | null
        }
        Relationships: []
      }
      kenya_counties: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      kenya_locations: {
        Row: {
          constituency: string
          county_id: number | null
          id: number
          ward: string
        }
        Insert: {
          constituency: string
          county_id?: number | null
          id: number
          ward: string
        }
        Update: {
          constituency?: string
          county_id?: number | null
          id?: number
          ward?: string
        }
        Relationships: [
          {
            foreignKeyName: "kenya_locations_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "kenya_counties"
            referencedColumns: ["id"]
          },
        ]
      }
      manifest_parcels: {
        Row: {
          confirmed_at: string | null
          created_at: string
          exception_flag: boolean
          exception_reason: string | null
          id: string
          manifest_id: string
          parcel_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          exception_flag?: boolean
          exception_reason?: string | null
          id?: string
          manifest_id: string
          parcel_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          exception_flag?: boolean
          exception_reason?: string | null
          id?: string
          manifest_id?: string
          parcel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manifest_parcels_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "manifests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifest_parcels_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      manifests: {
        Row: {
          arrived_at: string | null
          created_at: string
          created_by: string | null
          departed_at: string | null
          destination_site_id: string
          driver_id: string | null
          external_driver_name: string | null
          external_driver_phone: string | null
          external_driver_vehicle: string | null
          id: string
          manifest_number: string
          notes: string | null
          origin_site_id: string
          sealed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          created_by?: string | null
          departed_at?: string | null
          destination_site_id: string
          driver_id?: string | null
          external_driver_name?: string | null
          external_driver_phone?: string | null
          external_driver_vehicle?: string | null
          id?: string
          manifest_number: string
          notes?: string | null
          origin_site_id: string
          sealed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          created_by?: string | null
          departed_at?: string | null
          destination_site_id?: string
          driver_id?: string | null
          external_driver_name?: string | null
          external_driver_phone?: string | null
          external_driver_vehicle?: string | null
          id?: string
          manifest_number?: string
          notes?: string | null
          origin_site_id?: string
          sealed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manifests_destination_site_id_fkey"
            columns: ["destination_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifests_origin_site_id_fkey"
            columns: ["origin_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_statements: {
        Row: {
          account_id: string
          created_at: string
          id: string
          month: number
          paid_at: string | null
          payment_reference: string | null
          status: string
          total_amount: number
          total_parcels: number
          year: number
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          month: number
          paid_at?: string | null
          payment_reference?: string | null
          status?: string
          total_amount?: number
          total_parcels?: number
          year: number
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          month?: number
          paid_at?: string | null
          payment_reference?: string | null
          status?: string
          total_amount?: number
          total_parcels?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          created_at: string
          id: string
          message: string
          parcel_id: string | null
          provider: string | null
          recipient_phone: string
          sent_at: string | null
          status: string
          trigger_event: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          parcel_id?: string | null
          provider?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string
          trigger_event: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          parcel_id?: string | null
          provider?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string
          trigger_event?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      parcel_audit_log: {
        Row: {
          actioned_by: string | null
          actioned_by_role: string | null
          created_at: string
          id: string
          impersonated_by: string | null
          new_status: Database["public"]["Enums"]["parcel_status"]
          notes: string | null
          parcel_id: string
          previous_status: Database["public"]["Enums"]["parcel_status"] | null
          site_id: string | null
          site_name: string | null
        }
        Insert: {
          actioned_by?: string | null
          actioned_by_role?: string | null
          created_at?: string
          id?: string
          impersonated_by?: string | null
          new_status: Database["public"]["Enums"]["parcel_status"]
          notes?: string | null
          parcel_id: string
          previous_status?: Database["public"]["Enums"]["parcel_status"] | null
          site_id?: string | null
          site_name?: string | null
        }
        Update: {
          actioned_by?: string | null
          actioned_by_role?: string | null
          created_at?: string
          id?: string
          impersonated_by?: string | null
          new_status?: Database["public"]["Enums"]["parcel_status"]
          notes?: string | null
          parcel_id?: string
          previous_status?: Database["public"]["Enums"]["parcel_status"] | null
          site_id?: string | null
          site_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcel_audit_log_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcel_audit_log_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          account_id: string | null
          assigned_rider_id: string | null
          attempts: number
          cod_amount: number
          cod_settled: boolean
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          current_site_id: string | null
          damage_photo_path: string | null
          damaged_at_intake: boolean
          declared_value: number
          delivery_attempt_count: number
          destination_dc_id: string | null
          destination_site_id: string | null
          freight_amount: number
          freight_confirmed: boolean
          id: string
          origin_site_id: string | null
          payment_status: string
          pieces: number
          prohibited_declaration: boolean
          receiver_address: string | null
          receiver_county: string | null
          receiver_name: string
          receiver_phone: string | null
          receiver_town: string | null
          return_initiated_at: string | null
          return_reason: string | null
          scheduled_delivery_date: string | null
          sender_name: string
          sender_phone: string | null
          status: Database["public"]["Enums"]["parcel_status"]
          updated_at: string
          waybill: string
          waybill_type: Database["public"]["Enums"]["waybill_type"]
          weight_kg: number | null
        }
        Insert: {
          account_id?: string | null
          assigned_rider_id?: string | null
          attempts?: number
          cod_amount?: number
          cod_settled?: boolean
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          current_site_id?: string | null
          damage_photo_path?: string | null
          damaged_at_intake?: boolean
          declared_value?: number
          delivery_attempt_count?: number
          destination_dc_id?: string | null
          destination_site_id?: string | null
          freight_amount?: number
          freight_confirmed?: boolean
          id?: string
          origin_site_id?: string | null
          payment_status?: string
          pieces?: number
          prohibited_declaration?: boolean
          receiver_address?: string | null
          receiver_county?: string | null
          receiver_name: string
          receiver_phone?: string | null
          receiver_town?: string | null
          return_initiated_at?: string | null
          return_reason?: string | null
          scheduled_delivery_date?: string | null
          sender_name: string
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          updated_at?: string
          waybill: string
          waybill_type?: Database["public"]["Enums"]["waybill_type"]
          weight_kg?: number | null
        }
        Update: {
          account_id?: string | null
          assigned_rider_id?: string | null
          attempts?: number
          cod_amount?: number
          cod_settled?: boolean
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          current_site_id?: string | null
          damage_photo_path?: string | null
          damaged_at_intake?: boolean
          declared_value?: number
          delivery_attempt_count?: number
          destination_dc_id?: string | null
          destination_site_id?: string | null
          freight_amount?: number
          freight_confirmed?: boolean
          id?: string
          origin_site_id?: string | null
          payment_status?: string
          pieces?: number
          prohibited_declaration?: boolean
          receiver_address?: string | null
          receiver_county?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          receiver_town?: string | null
          return_initiated_at?: string | null
          return_reason?: string | null
          scheduled_delivery_date?: string | null
          sender_name?: string
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          updated_at?: string
          waybill?: string
          waybill_type?: Database["public"]["Enums"]["waybill_type"]
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_destination_dc_id_fkey"
            columns: ["destination_dc_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_destination_site_id_fkey"
            columns: ["destination_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_origin_site_id_fkey"
            columns: ["origin_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          employee_no: string
          full_name: string
          must_change_password: boolean
          phone: string | null
          site_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          employee_no: string
          full_name: string
          must_change_password?: boolean
          phone?: string | null
          site_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          employee_no?: string
          full_name?: string
          must_change_password?: boolean
          phone?: string | null
          site_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_parcel_assignments: {
        Row: {
          acknowledged_at: string | null
          assigned_by: string | null
          created_at: string
          handover_signature: string | null
          id: string
          parcel_id: string
          rider_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_by?: string | null
          created_at?: string
          handover_signature?: string | null
          id?: string
          parcel_id: string
          rider_id: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_by?: string | null
          created_at?: string
          handover_signature?: string | null
          id?: string
          parcel_id?: string
          rider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rider_parcel_assignments_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: true
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_regions: {
        Row: {
          counties: string[]
          created_at: string
          id: string
          is_active: boolean
          rider_id: string
          towns: string[]
          zone_name: string
        }
        Insert: {
          counties?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          rider_id: string
          towns?: string[]
          zone_name: string
        }
        Update: {
          counties?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          rider_id?: string
          towns?: string[]
          zone_name?: string
        }
        Relationships: []
      }
      scan_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["parcel_status"] | null
          id: string
          notes: string | null
          parcel_id: string
          photo_url: string | null
          signature_url: string | null
          site_id: string | null
          to_status: Database["public"]["Enums"]["parcel_status"] | null
          waybill: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["parcel_status"] | null
          id?: string
          notes?: string | null
          parcel_id: string
          photo_url?: string | null
          signature_url?: string | null
          site_id?: string | null
          to_status?: Database["public"]["Enums"]["parcel_status"] | null
          waybill: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["parcel_status"] | null
          id?: string
          notes?: string | null
          parcel_id?: string
          photo_url?: string | null
          signature_url?: string | null
          site_id?: string | null
          to_status?: Database["public"]["Enums"]["parcel_status"] | null
          waybill?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          region: string | null
          type: Database["public"]["Enums"]["site_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          region?: string | null
          type: Database["public"]["Enums"]["site_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          region?: string | null
          type?: Database["public"]["Enums"]["site_type"]
          updated_at?: string
        }
        Relationships: []
      }
      tariff_region_towns: {
        Row: {
          active: boolean
          county: string
          created_at: string
          id: string
          name: string
          region_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          county: string
          created_at?: string
          id?: string
          name: string
          region_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          county?: string
          created_at?: string
          id?: string
          name?: string
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tariff_region_towns_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "tariff_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      tariff_regions: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tariffs: {
        Row: {
          active: boolean
          base_rate: number
          created_at: string
          dest_region_id: string
          extra_kg: number
          id: string
          origin_region_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_rate?: number
          created_at?: string
          dest_region_id: string
          extra_kg?: number
          id?: string
          origin_region_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_rate?: number
          created_at?: string
          dest_region_id?: string
          extra_kg?: number
          id?: string
          origin_region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tariffs_dest_region_id_fkey"
            columns: ["dest_region_id"]
            isOneToOne: false
            referencedRelation: "tariff_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tariffs_origin_region_id_fkey"
            columns: ["origin_region_id"]
            isOneToOne: false
            referencedRelation: "tariff_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          created_at: string
          created_by: string | null
          id: string
          label: string
          mpesa_ref: string | null
          reference: string | null
          type: string
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          mpesa_ref?: string | null
          reference?: string | null
          type?: string
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          mpesa_ref?: string | null
          reference?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sites: {
        Row: {
          created_at: string
          id: string
          site_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          site_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_freight: {
        Args: { p_dest_town: string; p_origin_town: string; p_weight: number }
        Returns: number
      }
      generate_waybill_number: {
        Args: { p_type?: Database["public"]["Enums"]["waybill_type"] }
        Returns: string
      }
    }
    Enums: {
      account_type: "Prepaid" | "Postpaid"
      app_role: "super_admin" | "office" | "dc_admin" | "rider"
      parcel_status:
        | "Pending Confirmation"
        | "Rejected"
        | "Arrived at Origin Office"
        | "Departed to DC"
        | "Arrived at DC"
        | "Sorted at DC"
        | "Departed to Destination DC"
        | "Arrived at Destination DC"
        | "Sorted at Destination DC"
        | "Departed to Site Office"
        | "Arrived at Site Office"
        | "Out for Delivery"
        | "Ready for Collection"
        | "Delivered"
        | "Collected"
        | "Damaged at Intake"
        | "Under Investigation"
        | "Lost"
        | "On Hold - Address Issue"
        | "On Hold - Rescheduled"
        | "Delivery Attempted"
        | "Delivery Failed - Pending Decision"
        | "Return Initiated"
        | "Return in Transit"
        | "Return Arrived at Origin DC"
        | "Return Arrived at Origin Office"
        | "Return Delivered"
      site_type: "hq" | "dc" | "office" | "branch"
      waybill_type: "door_to_door" | "self_pickup" | "return"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["Prepaid", "Postpaid"],
      app_role: ["super_admin", "office", "dc_admin", "rider"],
      parcel_status: [
        "Pending Confirmation",
        "Rejected",
        "Arrived at Origin Office",
        "Departed to DC",
        "Arrived at DC",
        "Sorted at DC",
        "Departed to Destination DC",
        "Arrived at Destination DC",
        "Sorted at Destination DC",
        "Departed to Site Office",
        "Arrived at Site Office",
        "Out for Delivery",
        "Ready for Collection",
        "Delivered",
        "Collected",
        "Damaged at Intake",
        "Under Investigation",
        "Lost",
        "On Hold - Address Issue",
        "On Hold - Rescheduled",
        "Delivery Attempted",
        "Delivery Failed - Pending Decision",
        "Return Initiated",
        "Return in Transit",
        "Return Arrived at Origin DC",
        "Return Arrived at Origin Office",
        "Return Delivered",
      ],
      site_type: ["hq", "dc", "office", "branch"],
      waybill_type: ["door_to_door", "self_pickup", "return"],
    },
  },
} as const
