import { supabase } from "../lib/supabase"

export interface LoginDTO {
  email: string,
  password: string,
}

export interface RegisterDTO {
  email: string,
  password: string,
  username: string,
}

export const AuthService = {
  signIn: async ({ email, password }: LoginDTO) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error;
      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  signUp: async ({ email, password, username }: RegisterDTO) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })

      if (error) throw error;
      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
  }
}