export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
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
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
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
      follow: {
        Row: {
          created_at: string | null;
          follower_id: string | null;
          following_id: string | null;
          id: string;
          is_approved: boolean | null;
        };
        Insert: {
          created_at?: string | null;
          follower_id?: string | null;
          following_id?: string | null;
          id?: string;
          is_approved?: boolean | null;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string | null;
          following_id?: string | null;
          id?: string;
          is_approved?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "follow_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "follow_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
          },
        ];
      };
      item: {
        Row: {
          brand: string | null;
          category: string;
          color: string | null;
          image_url: string | null;
          item_id: string;
          material: string | null;
          name: string;
          source_type: Database["public"]["Enums"]["item_source_type"] | null;
          subcategory: string | null;
        };
        Insert: {
          brand?: string | null;
          category: string;
          color?: string | null;
          image_url?: string | null;
          item_id?: string;
          material?: string | null;
          name: string;
          source_type?: Database["public"]["Enums"]["item_source_type"] | null;
          subcategory?: string | null;
        };
        Update: {
          brand?: string | null;
          category?: string;
          color?: string | null;
          image_url?: string | null;
          item_id?: string;
          material?: string | null;
          name?: string;
          source_type?: Database["public"]["Enums"]["item_source_type"] | null;
          subcategory?: string | null;
        };
        Relationships: [];
      };
      outfit: {
        Row: {
          added_at: string | null;
          cover_image_url: string | null;
          id: string;
          is_public: boolean | null;
          is_saved: boolean | null;
          item_not_available: number | null;
          occasion: string | null;
          user_id: string | null;
          wear_count: number | null;
        };
        Insert: {
          added_at?: string | null;
          cover_image_url?: string | null;
          id?: string;
          is_public?: boolean | null;
          is_saved?: boolean | null;
          item_not_available?: number | null;
          occasion?: string | null;
          user_id?: string | null;
          wear_count?: number | null;
        };
        Update: {
          added_at?: string | null;
          cover_image_url?: string | null;
          id?: string;
          is_public?: boolean | null;
          is_saved?: boolean | null;
          item_not_available?: number | null;
          occasion?: string | null;
          user_id?: string | null;
          wear_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "outfit_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
          },
        ];
      };
      outfit_item: {
        Row: {
          id: string;
          layer_order: number | null;
          notes: string | null;
          outfit_id: string | null;
          wardrobe_item_id: string | null;
        };
        Insert: {
          id?: string;
          layer_order?: number | null;
          notes?: string | null;
          outfit_id?: string | null;
          wardrobe_item_id?: string | null;
        };
        Update: {
          id?: string;
          layer_order?: number | null;
          notes?: string | null;
          outfit_id?: string | null;
          wardrobe_item_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "outfit_item_outfit_id_fkey";
            columns: ["outfit_id"];
            isOneToOne: false;
            referencedRelation: "outfit";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outfit_item_wardrobe_item_id_fkey";
            columns: ["wardrobe_item_id"];
            isOneToOne: false;
            referencedRelation: "wardrobe_item";
            referencedColumns: ["id"];
          },
        ];
      };
      outfit_recommendation: {
        Row: {
          created_at: string | null;
          id: string;
          is_clicked: boolean | null;
          is_saved: boolean | null;
          occasion: string | null;
          outfit_id: string | null;
          reason: string | null;
          score: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_clicked?: boolean | null;
          is_saved?: boolean | null;
          occasion?: string | null;
          outfit_id?: string | null;
          reason?: string | null;
          score?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_clicked?: boolean | null;
          is_saved?: boolean | null;
          occasion?: string | null;
          outfit_id?: string | null;
          reason?: string | null;
          score?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "outfit_recommendation_outfit_id_fkey";
            columns: ["outfit_id"];
            isOneToOne: false;
            referencedRelation: "outfit";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outfit_recommendation_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user: {
        Row: {
          birthday: string | null;
          bust_size: number | null;
          created_at: string | null;
          display_name: string | null;
          email: string;
          gender: Database["public"]["Enums"]["gender_type"] | null;
          height: number | null;
          high_hip_size: number | null;
          hip_size: number | null;
          is_private: boolean | null;
          occupation: string | null;
          outfit_size: Database["public"]["Enums"]["outfit_size_type"] | null;
          profile_photo: string | null;
          shoe_size: string | null;
          shoe_size_region:
            Database["public"]["Enums"]["shoe_size_region_type"] | null;
          style_tags: Database["public"]["Enums"]["style_tag_type"][] | null;
          subscription_tier:
            Database["public"]["Enums"]["subscription_tier"] | null;
          user_id: string;
          username: string;
          waist_size: number | null;
          weight: number | null;
          work_setting: Database["public"]["Enums"]["work_setting_type"] | null;
        };
        Insert: {
          birthday?: string | null;
          bust_size?: number | null;
          created_at?: string | null;
          display_name?: string | null;
          email: string;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          height?: number | null;
          high_hip_size?: number | null;
          hip_size?: number | null;
          is_private?: boolean | null;
          occupation?: string | null;
          outfit_size?: Database["public"]["Enums"]["outfit_size_type"] | null;
          profile_photo?: string | null;
          shoe_size?: string | null;
          shoe_size_region?:
            Database["public"]["Enums"]["shoe_size_region_type"] | null;
          style_tags?: Database["public"]["Enums"]["style_tag_type"][] | null;
          subscription_tier?:
            Database["public"]["Enums"]["subscription_tier"] | null;
          user_id: string;
          username: string;
          waist_size?: number | null;
          weight?: number | null;
          work_setting?:
            Database["public"]["Enums"]["work_setting_type"] | null;
        };
        Update: {
          birthday?: string | null;
          bust_size?: number | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          height?: number | null;
          high_hip_size?: number | null;
          hip_size?: number | null;
          is_private?: boolean | null;
          occupation?: string | null;
          outfit_size?: Database["public"]["Enums"]["outfit_size_type"] | null;
          profile_photo?: string | null;
          shoe_size?: string | null;
          shoe_size_region?:
            Database["public"]["Enums"]["shoe_size_region_type"] | null;
          style_tags?: Database["public"]["Enums"]["style_tag_type"][] | null;
          subscription_tier?:
            Database["public"]["Enums"]["subscription_tier"] | null;
          user_id?: string;
          username?: string;
          waist_size?: number | null;
          weight?: number | null;
          work_setting?:
            Database["public"]["Enums"]["work_setting_type"] | null;
        };
        Relationships: [];
      };
      wardrobe_item: {
        Row: {
          acquired_at: string | null;
          created_at: string | null;
          id: string;
          image_url: string | null;
          is_public: boolean | null;
          is_wishlist: boolean | null;
          item_id: string | null;
          price: number | null;
          size: string | null;
          source: Database["public"]["Enums"]["wardrobe_source"] | null;
          source_url: string | null;
          user_id: string | null;
          wear_count: number | null;
        };
        Insert: {
          acquired_at?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          is_public?: boolean | null;
          is_wishlist?: boolean | null;
          item_id?: string | null;
          price?: number | null;
          size?: string | null;
          source?: Database["public"]["Enums"]["wardrobe_source"] | null;
          source_url?: string | null;
          user_id?: string | null;
          wear_count?: number | null;
        };
        Update: {
          acquired_at?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          is_public?: boolean | null;
          is_wishlist?: boolean | null;
          item_id?: string | null;
          price?: number | null;
          size?: string | null;
          source?: Database["public"]["Enums"]["wardrobe_source"] | null;
          source_url?: string | null;
          user_id?: string | null;
          wear_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "wardrobe_item_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "wardrobe_item_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
          },
        ];
      };
      wear_log: {
        Row: {
          created_at: string | null;
          id: string;
          outfit_id: string | null;
          user_id: string | null;
          worn_on: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          outfit_id?: string | null;
          user_id?: string | null;
          worn_on: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          outfit_id?: string | null;
          user_id?: string | null;
          worn_on?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wear_log_outfit_id_fkey";
            columns: ["outfit_id"];
            isOneToOne: false;
            referencedRelation: "outfit";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wear_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
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
      gender_type: "female" | "male" | "prefer_not_to_say" | "non_binary";
      item_source_type: "catalog" | "user_upload" | "affiliate";
      outfit_size_type: "xs" | "s" | "m" | "l" | "xl" | "it_varies";
      shoe_size_region_type: "uk" | "us" | "eu";
      style_tag_type:
        | "clean_minimal"
        | "effortlessly_casual"
        | "office_ready"
        | "soft_feminine"
        | "bold_expressive"
        | "street_inspired"
        | "still_figuring_it_out";
      subscription_tier: "free" | "premium";
      wardrobe_source: "TikTok" | "Instagram" | "Original";
      work_setting_type: "in_office" | "remote" | "hybrid" | "on_the_go";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      gender_type: ["female", "male", "prefer_not_to_say", "non_binary"],
      item_source_type: ["catalog", "user_upload", "affiliate"],
      outfit_size_type: ["xs", "s", "m", "l", "xl", "it_varies"],
      shoe_size_region_type: ["uk", "us", "eu"],
      style_tag_type: [
        "clean_minimal",
        "effortlessly_casual",
        "office_ready",
        "soft_feminine",
        "bold_expressive",
        "street_inspired",
        "still_figuring_it_out",
      ],
      subscription_tier: ["free", "premium"],
      wardrobe_source: ["TikTok", "Instagram", "Original"],
      work_setting_type: ["in_office", "remote", "hybrid", "on_the_go"],
    },
  },
} as const;
