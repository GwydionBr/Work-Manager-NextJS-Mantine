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
      cash_flow_category: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          title: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          addressee_id: string;
          created_at: string;
          id: string;
          requester_id: string;
          status: Database["public"]["Enums"]["status"];
        };
        Insert: {
          addressee_id?: string;
          created_at?: string;
          id?: string;
          requester_id?: string;
          status?: Database["public"]["Enums"]["status"];
        };
        Update: {
          addressee_id?: string;
          created_at?: string;
          id?: string;
          requester_id?: string;
          status?: Database["public"]["Enums"]["status"];
        };
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      grocery_item: {
        Row: {
          active: boolean;
          amount: number;
          checked: boolean;
          created_at: string;
          group_id: string;
          id: string;
          title: string;
          unit: Database["public"]["Enums"]["amountUnits"];
        };
        Insert: {
          active?: boolean;
          amount?: number;
          checked?: boolean;
          created_at?: string;
          group_id: string;
          id?: string;
          title: string;
          unit?: Database["public"]["Enums"]["amountUnits"];
        };
        Update: {
          active?: boolean;
          amount?: number;
          checked?: boolean;
          created_at?: string;
          group_id?: string;
          id?: string;
          title?: string;
          unit?: Database["public"]["Enums"]["amountUnits"];
        };
        Relationships: [
          {
            foreignKeyName: "grocery_item_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      group: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      group_appointment: {
        Row: {
          created_at: string;
          description: string | null;
          end_date: string | null;
          group_id: string;
          id: string;
          reminder: string | null;
          start_date: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          group_id?: string;
          id?: string;
          reminder?: string | null;
          start_date?: string;
          title?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          group_id?: string;
          id?: string;
          reminder?: string | null;
          start_date?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_appointment_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      group_member: {
        Row: {
          color: string;
          created_at: string;
          group_id: string;
          id: string;
          is_Admin: boolean;
          status: Database["public"]["Enums"]["status"];
          user_id: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          group_id?: string;
          id?: string;
          is_Admin?: boolean;
          status?: Database["public"]["Enums"]["status"];
          user_id?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          group_id?: string;
          id?: string;
          is_Admin?: boolean;
          status?: Database["public"]["Enums"]["status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_member_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      group_task: {
        Row: {
          created_at: string;
          exectution_date: string;
          executed: boolean;
          group_id: string;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          exectution_date?: string;
          executed?: boolean;
          group_id: string;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          exectution_date?: string;
          executed?: boolean;
          group_id?: string;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_task_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
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
          category_id: string | null;
          created_at: string;
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
          category_id?: string | null;
          created_at?: string;
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
          category_id?: string | null;
          created_at?: string;
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
        Relationships: [
          {
            foreignKeyName: "recurring_cash_flow_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "cash_flow_category";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_group_task: {
        Row: {
          created_at: string;
          date_time: string;
          end_date: string | null;
          group_id: string;
          id: string;
          interval_days: number;
          start_date: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date_time?: string;
          end_date?: string | null;
          group_id: string;
          id?: string;
          interval_days: number;
          start_date?: string;
          title?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          date_time?: string;
          end_date?: string | null;
          group_id?: string;
          id?: string;
          interval_days?: number;
          start_date?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_group_task_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          created_at: string;
          default_currency: Database["public"]["Enums"]["currency"];
          default_finance_currency: Database["public"]["Enums"]["currency"];
          default_group_color: string | null;
          default_project_hourly_payment: boolean;
          default_salary_amount: number;
          id: string;
          rounding_amount: Database["public"]["Enums"]["roundingAmount"];
          rounding_custom_amount: number;
          rounding_direction: Database["public"]["Enums"]["roundingDirection"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          default_currency?: Database["public"]["Enums"]["currency"];
          default_finance_currency?: Database["public"]["Enums"]["currency"];
          default_group_color?: string | null;
          default_project_hourly_payment?: boolean;
          default_salary_amount?: number;
          id?: string;
          rounding_amount?: Database["public"]["Enums"]["roundingAmount"];
          rounding_custom_amount?: number;
          rounding_direction?: Database["public"]["Enums"]["roundingDirection"];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          default_currency?: Database["public"]["Enums"]["currency"];
          default_finance_currency?: Database["public"]["Enums"]["currency"];
          default_group_color?: string | null;
          default_project_hourly_payment?: boolean;
          default_salary_amount?: number;
          id?: string;
          rounding_amount?: Database["public"]["Enums"]["roundingAmount"];
          rounding_custom_amount?: number;
          rounding_direction?: Database["public"]["Enums"]["roundingDirection"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      single_cash_flow: {
        Row: {
          amount: number;
          category_id: string | null;
          changed_date: string | null;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          date: string;
          id: string;
          is_active: boolean;
          recurring_cash_flow_id: string | null;
          title: string;
          type: Database["public"]["Enums"]["cash_flow_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          changed_date?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          date: string;
          id?: string;
          is_active?: boolean;
          recurring_cash_flow_id?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["cash_flow_type"];
          user_id?: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          changed_date?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          date?: string;
          id?: string;
          is_active?: boolean;
          recurring_cash_flow_id?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["cash_flow_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "single_cash_flow_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "cash_flow_category";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "single_cash_flow_recurring_cash_flow_id_fkey";
            columns: ["recurring_cash_flow_id"];
            isOneToOne: false;
            referencedRelation: "recurring_cash_flow";
            referencedColumns: ["id"];
          },
        ];
      };
      timer_project_folder: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          order_index: number | null;
          parent_folder: string | null;
          title: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          order_index?: number | null;
          parent_folder?: string | null;
          title: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          order_index?: number | null;
          parent_folder?: string | null;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "timer_project_folder_parent_folder_fkey";
            columns: ["parent_folder"];
            isOneToOne: false;
            referencedRelation: "timer_project_folder";
            referencedColumns: ["id"];
          },
        ];
      };
      timerProject: {
        Row: {
          created_at: string | null;
          currency: Database["public"]["Enums"]["currency"];
          description: string | null;
          folder_id: string | null;
          hourly_payment: boolean;
          id: string;
          is_favorite: boolean;
          order_index: number | null;
          salary: number;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          currency?: Database["public"]["Enums"]["currency"];
          description?: string | null;
          folder_id?: string | null;
          hourly_payment?: boolean;
          id?: string;
          is_favorite?: boolean;
          order_index?: number | null;
          salary: number;
          title: string;
          user_id?: string;
        };
        Update: {
          created_at?: string | null;
          currency?: Database["public"]["Enums"]["currency"];
          description?: string | null;
          folder_id?: string | null;
          hourly_payment?: boolean;
          id?: string;
          is_favorite?: boolean;
          order_index?: number | null;
          salary?: number;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timerProject_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "timer_project_folder";
            referencedColumns: ["id"];
          },
        ];
      };
      timerSession: {
        Row: {
          active_seconds: number;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          end_time: string;
          hourly_payment: boolean;
          id: string;
          paused_seconds: number;
          payed: boolean;
          project_id: string;
          salary: number;
          start_time: string;
          user_id: string;
        };
        Insert: {
          active_seconds: number;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          end_time: string;
          hourly_payment?: boolean;
          id?: string;
          paused_seconds?: number;
          payed?: boolean;
          project_id?: string;
          salary: number;
          start_time: string;
          user_id?: string;
        };
        Update: {
          active_seconds?: number;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          end_time?: string;
          hourly_payment?: boolean;
          id?: string;
          paused_seconds?: number;
          payed?: boolean;
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
      amountUnits: "kg" | "g" | "t" | "ml" | "l" | "amount";
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
      roundingAmount: "s" | "min" | "1/4h" | "1/2h" | "h" | "custom";
      roundingDirection: "up" | "down" | "nearest";
      status: "pending" | "accepted" | "declined";
      weekdays: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
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
      amountUnits: ["kg", "g", "t", "ml", "l", "amount"],
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
      roundingAmount: ["s", "min", "1/4h", "1/2h", "h", "custom"],
      roundingDirection: ["up", "down", "nearest"],
      status: ["pending", "accepted", "declined"],
      weekdays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
  },
} as const;
