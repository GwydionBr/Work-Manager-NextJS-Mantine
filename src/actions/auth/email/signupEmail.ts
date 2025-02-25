'use server';

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

interface AuthFormData {
  email: string
  name: string
  password: string
  terms: boolean
}

export async function signup(authFormData: AuthFormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: authFormData.email,
    password: authFormData.password,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/')
  redirect('/')
}