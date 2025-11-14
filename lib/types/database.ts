// Database Types for Supabase
// Generated manually from schema in supabase/migrations/001_initial_schema.sql
// TODO: After Supabase project is set up, regenerate with:
// npx supabase gen types typescript --project-id [project-id] > lib/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          oauth_provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          oauth_provider: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          oauth_provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      puzzles: {
        Row: {
          id: string
          puzzle_date: string
          puzzle_data: Json
          difficulty: string
          solution: Json
          created_at: string
        }
        Insert: {
          id?: string
          puzzle_date: string
          puzzle_data: Json
          difficulty: string
          solution: Json
          created_at?: string
        }
        Update: {
          id?: string
          puzzle_date?: string
          puzzle_data?: Json
          difficulty?: string
          solution?: Json
          created_at?: string
        }
      }
      completions: {
        Row: {
          id: string
          user_id: string | null
          puzzle_id: string | null
          completion_time_seconds: number | null
          completed_at: string | null
          is_guest: boolean | null
          completion_data: Json | null
          solve_path: Json | null
          started_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          puzzle_id?: string | null
          completion_time_seconds?: number | null
          completed_at?: string | null
          is_guest?: boolean | null
          completion_data?: Json | null
          solve_path?: Json | null
          started_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          puzzle_id?: string | null
          completion_time_seconds?: number | null
          completed_at?: string | null
          is_guest?: boolean | null
          completion_data?: Json | null
          solve_path?: Json | null
          started_at?: string
        }
      }
      leaderboards: {
        Row: {
          id: string
          puzzle_id: string | null
          user_id: string | null
          rank: number
          completion_time_seconds: number
          submitted_at: string
        }
        Insert: {
          id?: string
          puzzle_id?: string | null
          user_id?: string | null
          rank: number
          completion_time_seconds: number
          submitted_at?: string
        }
        Update: {
          id?: string
          puzzle_id?: string | null
          user_id?: string | null
          rank?: number
          completion_time_seconds?: number
          submitted_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string | null
          current_streak: number
          longest_streak: number
          last_completion_date: string
          freeze_available: boolean | null
          last_freeze_reset_date: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          current_streak?: number
          longest_streak?: number
          last_completion_date: string
          freeze_available?: boolean | null
          last_freeze_reset_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          current_streak?: number
          longest_streak?: number
          last_completion_date?: string
          freeze_available?: boolean | null
          last_freeze_reset_date?: string | null
        }
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
  }
}
