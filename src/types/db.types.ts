export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      recurring_cash_flow: {
        Row: {
          amount: number;
          currency: Database["public"]["Enums"]["currency"];
          description: string;
          end_date: string | null;
          id: string;
          interval: Database["public"]["Enums"]["finance_interval"];
          start_date: string;
          title: string;
          type: Database["public"]["Enums"]["cash_flow_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          currency?: Database["public"]["Enums"]["currency"];
          description: string;
          end_date?: string | null;
          id?: string;
          interval?: Database["public"]["Enums"]["finance_interval"];
          start_date: string;
          title: string;
          type?: Database["public"]["Enums"]["cash_flow_type"];
          user_id?: string;
        };
        Update: {
          amount?: number;
          currency?: Database["public"]["Enums"]["currency"];
          description?: string;
          end_date?: string | null;
          id?: string;
          interval?: Database["public"]["Enums"]["finance_interval"];
          start_date?: string;
          title?: string;
          type?: Database["public"]["Enums"]["cash_flow_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          default_currency: Database["public"]["Enums"]["currency"];
          default_finance_currency: Database["public"]["Enums"]["currency"];
          id: string;
          rounding_amount: Database["public"]["Enums"]["roundingAmount"];
          rounding_direction: Database["public"]["Enums"]["roundingDirection"];
          user_id: string;
        };
        Insert: {
          default_currency?: Database["public"]["Enums"]["currency"];
          default_finance_currency?: Database["public"]["Enums"]["currency"];
          id?: string;
          rounding_amount?: Database["public"]["Enums"]["roundingAmount"];
          rounding_direction?: Database["public"]["Enums"]["roundingDirection"];
          user_id?: string;
        };
        Update: {
          default_currency?: Database["public"]["Enums"]["currency"];
          default_finance_currency?: Database["public"]["Enums"]["currency"];
          id?: string;
          rounding_amount?: Database["public"]["Enums"]["roundingAmount"];
          rounding_direction?: Database["public"]["Enums"]["roundingDirection"];
          user_id?: string;
        };
        Relationships: [];
      };
      single_cash_flow: {
        Row: {
          amount: number;
          currency: Database["public"]["Enums"]["currency"];
          date: string;
          id: string;
          title: string;
          type: Database["public"]["Enums"]["cash_flow_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          currency?: Database["public"]["Enums"]["currency"];
          date: string;
          id?: string;
          title?: string;
          type?: Database["public"]["Enums"]["cash_flow_type"];
          user_id?: string;
        };
        Update: {
          amount?: number;
          currency?: Database["public"]["Enums"]["currency"];
          date?: string;
          id?: string;
          title?: string;
          type?: Database["public"]["Enums"]["cash_flow_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      timerProject: {
        Row: {
          currency: Database["public"]["Enums"]["currency"];
          description: string;
          id: string;
          is_favorite: boolean;
          salary: number;
          title: string;
          user_id: string;
        };
        Insert: {
          currency?: Database["public"]["Enums"]["currency"];
          description: string;
          id?: string;
          is_favorite?: boolean;
          salary: number;
          title: string;
          user_id?: string;
        };
        Update: {
          currency?: Database["public"]["Enums"]["currency"];
          description?: string;
          id?: string;
          is_favorite?: boolean;
          salary?: number;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      timerSession: {
        Row: {
          active_seconds: number;
          currency: Database["public"]["Enums"]["currency"];
          end_time: string;
          id: string;
          paused_seconds: number;
          project_id: string;
          salary: number;
          start_time: string;
          user_id: string;
        };
        Insert: {
          active_seconds: number;
          currency?: Database["public"]["Enums"]["currency"];
          end_time: string;
          id?: string;
          paused_seconds?: number;
          project_id?: string;
          salary: number;
          start_time: string;
          user_id?: string;
        };
        Update: {
          active_seconds?: number;
          currency?: Database["public"]["Enums"]["currency"];
          end_time?: string;
          id?: string;
          paused_seconds?: number;
          project_id?: string;
          salary?: number;
          start_time?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timerSession_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "timerProject";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      cash_flow_type: "expense" | "income";
      currency:
        | "USD"
        | "EUR"
        | "GBP"
        | "CAD"
        | "AUD"
        | "JPY"
        | "CHF"
        | "CNY"
        | "INR"
        | "BRL"
        | "VEF";
      finance_interval:
        | "day"
        | "week"
        | "month"
        | "1/4 year"
        | "1/2 year"
        | "year";
      roundingAmount: "s" | "min" | "1/4h" | "1/2h" | "h";
      roundingDirection: "up" | "down" | "nearest";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      cash_flow_type: ["expense", "income"],
      currency: [
        "USD",
        "EUR",
        "GBP",
        "CAD",
        "AUD",
        "JPY",
        "CHF",
        "CNY",
        "INR",
        "BRL",
        "VEF",
      ],
      finance_interval: [
        "day",
        "week",
        "month",
        "1/4 year",
        "1/2 year",
        "year",
      ],
      roundingAmount: ["s", "min", "1/4h", "1/2h", "h"],
      roundingDirection: ["up", "down", "nearest"],
    },
  },
} as const;
