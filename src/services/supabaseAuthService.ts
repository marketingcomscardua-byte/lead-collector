import { supabase } from '../lib/supabase';
import { Seller } from '../types/seller';

export const supabaseAuthService = {
  async login(loginValue: string, passwordValue: string): Promise<Seller> {
    const loginKey = loginValue.trim().toLowerCase();
    const cleanPassword = passwordValue.trim();

    let email = '';
    let profile: any = null;

    if (loginKey.includes('@')) {
      email = loginKey;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(name)')
        .eq('email', email)
        .maybeSingle();
      if (data) profile = data;
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(name)')
        .eq('username', loginKey)
        .maybeSingle();
      if (data) {
        profile = data;
        email = data.email;
      }
    }

    if (!profile) {
      throw new Error('Usuário/E-mail não cadastrados.');
    }

    if (profile.status === 'Inativo' || profile.status === 'inactive') {
      throw new Error('Este usuário está inativo.');
    }

    // Try normal sign in first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: cleanPassword
    });

    if (!authError && authData?.user) {
      // If profile auth_user_id is not set, link it
      if (!profile.auth_user_id) {
        await supabase
          .from('profiles')
          .update({ auth_user_id: authData.user.id })
          .eq('id', profile.id);
      }

      return {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        username: profile.username,
        role: profile.role,
        isProtected: profile.is_protected,
        companyId: profile.company_id,
        companyName: profile.companies?.name || 'Sem Empresa',
        status: profile.status,
        avatar: profile.avatar
      } as Seller;
    }

    // Auth error or missing user - check if we can do on-demand signUp
    // If the entered password matches the seeded profile password
    if (profile.password === cleanPassword) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: cleanPassword
      });

      if (!signUpError && signUpData?.user) {
        // Link auth user ID
        await supabase
          .from('profiles')
          .update({ auth_user_id: signUpData.user.id })
          .eq('id', profile.id);

        return {
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          username: profile.username,
          role: profile.role,
          isProtected: profile.is_protected,
          companyId: profile.company_id,
          companyName: profile.companies?.name || 'Sem Empresa',
          status: profile.status,
          avatar: profile.avatar
        } as Seller;
      }
    }

    throw new Error('Usuário/E-mail ou senha incorretos.');
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentSeller(): Promise<Seller | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, companies(name)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (error || !profile) return null;

    if (profile.status === 'Inativo' || profile.status === 'inactive') {
      return null;
    }

    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      username: profile.username,
      role: profile.role,
      isProtected: profile.is_protected,
      companyId: profile.company_id,
      companyName: profile.companies?.name || 'Sem Empresa',
      status: profile.status,
      avatar: profile.avatar
    } as Seller;
  }
};
