export type BookingType =
  | "flight"
  | "hotel"
  | "package"
  | "transfer"
  | "visa"
  | "tour"
  | "car"
  | "callback"
  | "contact"
  | "general";

export type BookingStatus = "new" | "in-progress" | "resolved";

export type ProfileRole = "customer" | "admin";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

export type BookingRow = {
  id: string;
  user_id: string | null;
  type: BookingType;
  status: BookingStatus;
  service_name: string | null;
  destination: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<Omit<ProfileRow, "id">>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: {
          id?: string;
          user_id?: string | null;
          type: BookingType;
          status?: BookingStatus;
          service_name?: string | null;
          destination?: string | null;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          message?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BookingRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
