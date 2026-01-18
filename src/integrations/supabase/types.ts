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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      agency_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          related_candidate_id: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_candidate_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_candidate_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_tasks_related_candidate_id_fkey"
            columns: ["related_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          stage_document_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          stage_document_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          stage_document_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_stage_document_id_fkey"
            columns: ["stage_document_id"]
            isOneToOne: false
            referencedRelation: "stage_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          country_code: string | null
          created_at: string
          current_stage: Database["public"]["Enums"]["candidate_stage"]
          date_of_birth: string | null
          destination_country: string | null
          email: string | null
          emergency_contact_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer: string | null
          father_name: string | null
          full_name: string
          given_name: string | null
          id: string
          issuing_authority: string | null
          job_title: string | null
          legal_guardian_name: string | null
          medical_expiry_date: string | null
          medical_fit_date: string | null
          mother_name: string | null
          nationality: string | null
          notes: string | null
          passport_expiry_date: string | null
          passport_issue_date: string | null
          passport_number: string | null
          passport_scan_url: string | null
          passport_type: string | null
          permanent_address: string | null
          personal_number: string | null
          phone: string | null
          place_of_birth: string | null
          previous_passport_number: string | null
          sex: string | null
          surname: string | null
          updated_at: string
          user_id: string | null
          visa_expiry_date: string | null
          visa_issue_date: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          current_stage?: Database["public"]["Enums"]["candidate_stage"]
          date_of_birth?: string | null
          destination_country?: string | null
          email?: string | null
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer?: string | null
          father_name?: string | null
          full_name: string
          given_name?: string | null
          id?: string
          issuing_authority?: string | null
          job_title?: string | null
          legal_guardian_name?: string | null
          medical_expiry_date?: string | null
          medical_fit_date?: string | null
          mother_name?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_number?: string | null
          passport_scan_url?: string | null
          passport_type?: string | null
          permanent_address?: string | null
          personal_number?: string | null
          phone?: string | null
          place_of_birth?: string | null
          previous_passport_number?: string | null
          sex?: string | null
          surname?: string | null
          updated_at?: string
          user_id?: string | null
          visa_expiry_date?: string | null
          visa_issue_date?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          current_stage?: Database["public"]["Enums"]["candidate_stage"]
          date_of_birth?: string | null
          destination_country?: string | null
          email?: string | null
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer?: string | null
          father_name?: string | null
          full_name?: string
          given_name?: string | null
          id?: string
          issuing_authority?: string | null
          job_title?: string | null
          legal_guardian_name?: string | null
          medical_expiry_date?: string | null
          medical_fit_date?: string | null
          mother_name?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_number?: string | null
          passport_scan_url?: string | null
          passport_type?: string | null
          permanent_address?: string | null
          personal_number?: string | null
          phone?: string | null
          place_of_birth?: string | null
          previous_passport_number?: string | null
          sex?: string | null
          surname?: string | null
          updated_at?: string
          user_id?: string | null
          visa_expiry_date?: string | null
          visa_issue_date?: string | null
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string
          flights_completed: number | null
          id: string
          new_candidates: number | null
          report_date: string
          stage_completions: number | null
          summary: string | null
          total_candidates: number | null
          user_id: string | null
          visas_issued: number | null
        }
        Insert: {
          created_at?: string
          flights_completed?: number | null
          id?: string
          new_candidates?: number | null
          report_date?: string
          stage_completions?: number | null
          summary?: string | null
          total_candidates?: number | null
          user_id?: string | null
          visas_issued?: number | null
        }
        Update: {
          created_at?: string
          flights_completed?: number | null
          id?: string
          new_candidates?: number | null
          report_date?: string
          stage_completions?: number | null
          summary?: string | null
          total_candidates?: number | null
          user_id?: string | null
          visas_issued?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_approved: boolean
          rejection_reason: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_approved?: boolean
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stage_documents: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          document_name: string
          id: string
          is_required: boolean | null
          stage: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          document_name: string
          id?: string
          is_required?: boolean | null
          stage: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          document_name?: string
          id?: string
          is_required?: boolean | null
          stage?: string
        }
        Relationships: []
      }
      stage_history: {
        Row: {
          candidate_id: string
          completed_at: string
          id: string
          notes: string | null
          stage: Database["public"]["Enums"]["candidate_stage"]
          user_id: string | null
        }
        Insert: {
          candidate_id: string
          completed_at?: string
          id?: string
          notes?: string | null
          stage: Database["public"]["Enums"]["candidate_stage"]
          user_id?: string | null
        }
        Update: {
          candidate_id?: string
          completed_at?: string
          id?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["candidate_stage"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_history_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      candidate_stage:
        | "passport_received"
        | "medical"
        | "police_clearance"
        | "interview"
        | "mofa"
        | "taseer"
        | "takamul"
        | "training"
        | "fingerprint"
        | "embassy"
        | "visa_issued"
        | "flight"
        | "manpower"
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
      app_role: ["admin", "user"],
      candidate_stage: [
        "passport_received",
        "medical",
        "police_clearance",
        "interview",
        "mofa",
        "taseer",
        "takamul",
        "training",
        "fingerprint",
        "embassy",
        "visa_issued",
        "flight",
        "manpower",
      ],
    },
  },
} as const
