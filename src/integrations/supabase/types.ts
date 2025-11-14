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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          analytics_enabled: boolean | null
          auto_backup_enabled: boolean | null
          backup_frequency: string | null
          beauty_reminders: boolean | null
          compact_view: boolean | null
          created_at: string | null
          data_sharing: boolean | null
          fasting_reminders: boolean | null
          id: string
          notifications_enabled: boolean | null
          period_reminders: boolean | null
          routine_reminders: boolean | null
          show_hijri_dates: boolean | null
          show_lunar_calendar: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          auto_backup_enabled?: boolean | null
          backup_frequency?: string | null
          beauty_reminders?: boolean | null
          compact_view?: boolean | null
          created_at?: string | null
          data_sharing?: boolean | null
          fasting_reminders?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          period_reminders?: boolean | null
          routine_reminders?: boolean | null
          show_hijri_dates?: boolean | null
          show_lunar_calendar?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics_enabled?: boolean | null
          auto_backup_enabled?: boolean | null
          backup_frequency?: string | null
          beauty_reminders?: boolean | null
          compact_view?: boolean | null
          created_at?: string | null
          data_sharing?: boolean | null
          fasting_reminders?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          period_reminders?: boolean | null
          routine_reminders?: boolean | null
          show_hijri_dates?: boolean | null
          show_lunar_calendar?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      apple_health_settings: {
        Row: {
          auto_sync_enabled: boolean | null
          auto_sync_time: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          sync_heart_rate: boolean | null
          sync_sleep: boolean | null
          sync_steps: boolean | null
          sync_weight: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_sync_enabled?: boolean | null
          auto_sync_time?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_heart_rate?: boolean | null
          sync_sleep?: boolean | null
          sync_steps?: boolean | null
          sync_weight?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_sync_enabled?: boolean | null
          auto_sync_time?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_heart_rate?: boolean | null
          sync_sleep?: boolean | null
          sync_steps?: boolean | null
          sync_weight?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          body: string
          category: string
          created_at: string
          id: string
          lang: string
          reference_url: string | null
          source: string | null
          title: string
        }
        Insert: {
          author?: string | null
          body: string
          category: string
          created_at?: string
          id?: string
          lang: string
          reference_url?: string | null
          source?: string | null
          title: string
        }
        Update: {
          author?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          lang?: string
          reference_url?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      beauty_action_history: {
        Row: {
          created_at: string
          duplicated_at: string
          id: string
          next_due_date: string
          original_action_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duplicated_at?: string
          id?: string
          next_due_date: string
          original_action_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          duplicated_at?: string
          id?: string
          next_due_date?: string
          original_action_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beauty_action_history_original_action_id_fkey"
            columns: ["original_action_id"]
            isOneToOne: false
            referencedRelation: "beauty_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_actions: {
        Row: {
          action_type: string | null
          beauty_category: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          frequency: string | null
          goal: string | null
          id: string
          is_visible: boolean | null
          notes: string | null
          phase: string
          reason: string | null
          reminder_enabled: boolean
          reminder_hours_before: number | null
          scheduled_at: string | null
          score: number | null
          time_of_day: string | null
          title: string
          updated_at: string
          user_id: string
          warnings: string[] | null
        }
        Insert: {
          action_type?: string | null
          beauty_category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          frequency?: string | null
          goal?: string | null
          id?: string
          is_visible?: boolean | null
          notes?: string | null
          phase: string
          reason?: string | null
          reminder_enabled?: boolean
          reminder_hours_before?: number | null
          scheduled_at?: string | null
          score?: number | null
          time_of_day?: string | null
          title: string
          updated_at?: string
          user_id: string
          warnings?: string[] | null
        }
        Update: {
          action_type?: string | null
          beauty_category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          frequency?: string | null
          goal?: string | null
          id?: string
          is_visible?: boolean | null
          notes?: string | null
          phase?: string
          reason?: string | null
          reminder_enabled?: boolean
          reminder_hours_before?: number | null
          scheduled_at?: string | null
          score?: number | null
          time_of_day?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "beauty_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          is_system: boolean | null
          name: string
          name_en: string | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          is_system?: boolean | null
          name: string
          name_en?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          is_system?: boolean | null
          name?: string
          name_en?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beauty_routines: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          frequency: string
          id: string
          reminder_enabled: boolean | null
          reminder_time: string | null
          time_of_day: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          frequency: string
          id?: string
          reminder_enabled?: boolean | null
          reminder_time?: string | null
          time_of_day?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          frequency?: string
          id?: string
          reminder_enabled?: boolean | null
          reminder_time?: string | null
          time_of_day?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleanup_logs: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string
          execution_time_ms: number | null
          id: string
          stats: Json
          status: string
          total_deleted: number
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          stats?: Json
          status?: string
          total_deleted?: number
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          stats?: Json
          status?: string
          total_deleted?: number
        }
        Relationships: []
      }
      cycle_days: {
        Row: {
          created_at: string
          date: string
          flow: string | null
          id: string
          mood: string | null
          notes: string | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          flow?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          flow?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_days_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string
          duration: number | null
          end_date: string | null
          id: string
          length: number | null
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_date?: string | null
          id?: string
          length?: number | null
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_date?: string | null
          id?: string
          length?: number | null
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daughter_cycles: {
        Row: {
          created_at: string
          daughter_id: string
          duration: number | null
          end_date: string | null
          id: string
          length: number | null
          notes: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daughter_id: string
          duration?: number | null
          end_date?: string | null
          id?: string
          length?: number | null
          notes?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daughter_id?: string
          duration?: number | null
          end_date?: string | null
          id?: string
          length?: number | null
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daughter_cycles_daughter_id_fkey"
            columns: ["daughter_id"]
            isOneToOne: false
            referencedRelation: "daughters"
            referencedColumns: ["id"]
          },
        ]
      }
      daughter_fasting_entries: {
        Row: {
          completed_at: string | null
          created_at: string
          date: string
          daughter_id: string
          id: string
          is_completed: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date: string
          daughter_id: string
          id?: string
          is_completed?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date?: string
          daughter_id?: string
          id?: string
          is_completed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daughter_fasting_entries_daughter_id_fkey"
            columns: ["daughter_id"]
            isOneToOne: false
            referencedRelation: "daughters"
            referencedColumns: ["id"]
          },
        ]
      }
      daughters: {
        Row: {
          birth_date: string | null
          created_at: string | null
          cycle_start_age: number | null
          id: string
          is_pregnant: boolean | null
          mother_id: string
          name: string
          notes: string | null
          pregnancy_edd: string | null
          pregnancy_lmp: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          cycle_start_age?: number | null
          id?: string
          is_pregnant?: boolean | null
          mother_id: string
          name: string
          notes?: string | null
          pregnancy_edd?: string | null
          pregnancy_lmp?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          cycle_start_age?: number | null
          id?: string
          is_pregnant?: boolean | null
          mother_id?: string
          name?: string
          notes?: string | null
          pregnancy_edd?: string | null
          pregnancy_lmp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fasting_entries: {
        Row: {
          completed_at: string | null
          created_at: string
          date: string
          id: string
          is_completed: boolean
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date: string
          id?: string
          is_completed?: boolean
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          is_completed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fasting_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          appointment_type: string
          completed: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          appointment_type: string
          completed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          appointment_type?: string
          completed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pregnancy_medicines: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          medicine_name: string
          notes: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medicine_name: string
          notes?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medicine_name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pregnancy_notes: {
        Row: {
          created_at: string | null
          id: string
          note_date: string
          note_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_date: string
          note_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note_date?: string
          note_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          breastfeeding: boolean | null
          breastfeeding_start_date: string | null
          created_at: string
          email: string | null
          fasting_manual_adjustment: number
          id: string
          is_pregnant: boolean | null
          is_premium: boolean
          locale: string
          name: string | null
          persona: string
          postpartum_start_date: string | null
          pregnancy_calculation_method: string | null
          pregnancy_due_date: string | null
          pregnancy_edd: string | null
          pregnancy_lmp: string | null
          pregnancy_weeks: number | null
          theme: string
          updated_at: string
        }
        Insert: {
          breastfeeding?: boolean | null
          breastfeeding_start_date?: string | null
          created_at?: string
          email?: string | null
          fasting_manual_adjustment?: number
          id: string
          is_pregnant?: boolean | null
          is_premium?: boolean
          locale?: string
          name?: string | null
          persona: string
          postpartum_start_date?: string | null
          pregnancy_calculation_method?: string | null
          pregnancy_due_date?: string | null
          pregnancy_edd?: string | null
          pregnancy_lmp?: string | null
          pregnancy_weeks?: number | null
          theme?: string
          updated_at?: string
        }
        Update: {
          breastfeeding?: boolean | null
          breastfeeding_start_date?: string | null
          created_at?: string
          email?: string | null
          fasting_manual_adjustment?: number
          id?: string
          is_pregnant?: boolean | null
          is_premium?: boolean
          locale?: string
          name?: string | null
          persona?: string
          postpartum_start_date?: string | null
          pregnancy_calculation_method?: string | null
          pregnancy_due_date?: string | null
          pregnancy_edd?: string | null
          pregnancy_lmp?: string | null
          pregnancy_weeks?: number | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_logs: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          log_date: string
          notes: string | null
          routine_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          log_date: string
          notes?: string | null
          routine_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          routine_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      routine_products: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          routine_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          routine_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          routine_id?: string
        }
        Relationships: []
      }
      share_links: {
        Row: {
          code: string
          connected_user_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          owner_id: string
          privacy_settings: Json | null
          scope: Json
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          connected_user_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          owner_id: string
          privacy_settings?: Json | null
          scope?: Json
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          connected_user_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          owner_id?: string
          privacy_settings?: Json | null
          scope?: Json
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          share_link_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          share_link_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          share_link_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_events_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_authorized_partner: {
        Args: { _owner_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
