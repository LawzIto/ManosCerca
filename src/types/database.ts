// Tipos de la base de datos. Escritos a mano para arrancar, con el mismo formato
// que `supabase gen types`. Regenerar con `npm run db:types` cuando el esquema cambie.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ServiceRequestRow = {
  id: string;
  client_id: string;
  category_id: number;
  professional_id: string | null;
  accepted_proposal_id: string | null;
  title: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  budget_estimate: number | null;
  status: Database["public"]["Enums"]["request_status"];
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          verification_status: Database["public"]["Enums"]["verification_status"];
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      professional_categories: {
        Row: { professional_id: string; category_id: number };
        Insert: { professional_id: string; category_id: number };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "professional_categories_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      service_requests: {
        Row: ServiceRequestRow;
        Insert: {
          id?: string;
          client_id: string;
          category_id: number;
          title: string;
          description: string;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          budget_estimate?: number | null;
          scheduled_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          budget_estimate?: number | null;
          scheduled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_accepted_proposal_fk";
            columns: ["accepted_proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
        ];
      };
      proposals: {
        Row: {
          id: string;
          request_id: string;
          professional_id: string;
          price: number;
          message: string | null;
          eta_minutes: number | null;
          status: Database["public"]["Enums"]["proposal_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          professional_id: string;
          price: number;
          message?: string | null;
          eta_minutes?: number | null;
        };
        Update: {
          price?: number;
          message?: string | null;
          eta_minutes?: number | null;
          status?: "pendiente" | "retirada";
        };
        Relationships: [
          {
            foreignKeyName: "proposals_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "service_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          request_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "reviews_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "service_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey";
            columns: ["reviewee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      accept_proposal: {
        Args: { p_proposal_id: string };
        Returns: ServiceRequestRow;
      };
      update_request_status: {
        Args: {
          p_request_id: string;
          p_status: Database["public"]["Enums"]["request_status"];
        };
        Returns: ServiceRequestRow;
      };
      get_my_phone: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      get_request_contact: {
        Args: { p_request_id: string };
        Returns: { full_name: string; phone: string | null }[];
      };
      current_role_is: {
        Args: { target: Database["public"]["Enums"]["user_role"] };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "client" | "professional" | "admin";
      verification_status: "unverified" | "pending" | "verified" | "rejected";
      request_status: "pendiente" | "aceptado" | "en_progreso" | "completado" | "cancelado";
      proposal_status: "pendiente" | "aceptada" | "rechazada" | "retirada";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

/** Fila de una tabla: `Tables<"profiles">`. */
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
