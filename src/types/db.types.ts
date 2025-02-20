export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      generalUserSettings: {
        Row: {
          default_currency: string
          id: string
          rounding_option: string
          user_id: string
        }
        Insert: {
          default_currency?: string
          id?: string
          rounding_option?: string
          user_id: string
        }
        Update: {
          default_currency?: string
          id?: string
          rounding_option?: string
          user_id?: string
        }
        Relationships: []
      }
      payout: {
        Row: {
          amount: number
          date: string
          id: number
          user_id: string
        }
        Insert: {
          amount: number
          date: string
          id?: number
          user_id?: string
        }
        Update: {
          amount?: number
          date?: string
          id: number
          user_id?: string
        }
        Relationships: []
      }
      spending: {
        Row: {
          amount: number
          description: string | null
          end_date: string | null
          id: number
          monthly: boolean
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          amount: number
          description?: string | null
          end_date?: string | null
          id?: number
          monthly: boolean
          start_date: string
          title: string
          user_id?: string
        }
        Update: {
          amount?: number
          description?: string | null
          end_date?: string | null
          id: number
          monthly?: boolean
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      test: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id: number
          name?: string | null
        }
        Relationships: []
      }
      timerProject: {
        Row: {
          currency: string | null
          description: string
          id: string
          is_favorite: boolean | null
          salary: number
          title: string
          user_id: string
        }
        Insert: {
          currency?: string | null
          description: string
          id: string
          is_favorite?: boolean | null
          salary: number
          title: string
          user_id?: string
        }
        Update: {
          currency?: string | null
          description?: string
          id: string
          is_favorite?: boolean | null
          salary?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      timerSession: {
        Row: {
          active_seconds: number 
          currency: string 
          end_time: string
          id: string
          paused_seconds: number 
          project_id: string 
          salary: number 
          start_time: string 
          user_id: string
        }
        Insert: {
          active_seconds?: number | null
          currency?: string | null
          end_time: string
          id?: string
          paused_seconds?: number | null
          project_id?: string | null
          salary?: number | null
          start_time?: string | null
          user_id?: string
        }
        Update: {
          active_seconds?: number | null
          currency?: string | null
          end_time?: string
          id: string
          paused_seconds?: number | null
          project_id?: string | null
          salary?: number | null
          start_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timerSession_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "timerProject"
            referencedColumns: ["id"]
          },
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
