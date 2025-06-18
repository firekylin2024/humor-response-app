export interface Database {
  public: {
    Tables: {
      humor_responses: {
        Row: {
          id: string
          user_id: string
          input: string
          intensity: number
          responses: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input: string
          intensity: number
          responses: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          input?: string
          intensity?: number
          responses?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type HumorResponse = Database['public']['Tables']['humor_responses']['Row']
export type HumorResponseInsert = Database['public']['Tables']['humor_responses']['Insert']
export type HumorResponseUpdate = Database['public']['Tables']['humor_responses']['Update'] 