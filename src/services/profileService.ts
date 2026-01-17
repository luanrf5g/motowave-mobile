import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string,
  username: string,
  bio?: string,
  birthday: string,
  avatar_slug?: string,
  email?: string,
}

export const ProfileService = {
  getProfile: async (): Promise<UserProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('profiles')
      .select('username, bio, birthday, avatar_slug')
      .eq('id', user.id)
      .single()

    if (error) throw error;

    return {
      id: user.id,
      email: user.email,
      username: data.username || 'Viajante',
      bio: data.bio || '',
      birthday: data.birthday || '',
      avatar_slug: data.avatar_slug || 'racing-helmet'
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error;
  }
}