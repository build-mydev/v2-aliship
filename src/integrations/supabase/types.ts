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
      parcels: {
        Row: {
          assigned_rider_id: string | null
          attempts: number
          cod_amount: number
          cod_settled: boolean
          created_at: string
          created_by: string | null
          current_site_id: string | null
          destination_site_id: string | null
          id: string
          origin_site_id: string | null
          pieces: number
          receiver_address: string | null
          receiver_name: string
          receiver_phone: string | null
          sender_name: string
          sender_phone: string | null
          status: Database["public"]["Enums"]["parcel_status"]
          updated_at: string
          waybill: string
          weight_kg: number | null
        }
        Insert: {
          assigned_rider_id?: string | null
          attempts?: number
          cod_amount?: number
          cod_settled?: boolean
          created_at?: string
          created_by?: string | null
          current_site_id?: string | null
          destination_site_id?: string | null
          id?: string
          origin_site_id?: string | null
          pieces?: number
          receiver_address?: string | null
          receiver_name: string
          receiver_phone?: string | null
          sender_name: string
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          updated_at?: string
          waybill: string
          weight_kg?: number | null
        }
        Update: {
          assigned_rider_id?: string | null
          attempts?: number
          cod_amount?: number
          cod_settled?: boolean
          created_at?: string
          created_by?: string | null
          current_site_id?: string | null
          destination_site_id?: string | null
          id?: string
          origin_site_id?: string | null
          pieces?: number
          receiver_address?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          sender_name?: string
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          updated_at?: string
          waybill?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_current_site_id_fkey"
            columns: ["current_site_id"]
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
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          created_at: string
          created_by: string | null
          id: string
          label: string
          reference: string | null
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          reference?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          reference?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      my_site_id: { Args: never; Returns: string }
    }
    Enums: {
      account_type: "Prepaid" | "Postpaid"
      app_role: "super_admin" | "office" | "dc_admin" | "rider"
      parcel_status:
        | "Pending Pickup"
        | "Picked Up"
        | "Departed"
        | "Arrived"
        | "Ready for Collection"
        | "Out for Delivery"
        | "Delivered"
        | "Exception"
        | "Returned"
        | "Under Investigation"
        | "Lost"
      site_type: "HQ" | "Office" | "DC"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
        "Pending Pickup",
        "Picked Up",
        "Departed",
        "Arrived",
        "Ready for Collection",
        "Out for Delivery",
        "Delivered",
        "Exception",
        "Returned",
        "Under Investigation",
        "Lost",
      ],
      site_type: ["HQ", "Office", "DC"],
    },
  },
} as const
