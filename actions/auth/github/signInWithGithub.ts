'use server';

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export default async function signInWithGithub() {
  const supabase = await createClient()
  const provider = 'github'

  const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: 'http://localhost:3000/auth/callback',
  },
})

if (data.url) {
  redirect(data.url) // use the redirect API for your server framework
}


  if (error) {
    redirect('/error')
  }

  revalidatePath('/')
  redirect('/')
}
