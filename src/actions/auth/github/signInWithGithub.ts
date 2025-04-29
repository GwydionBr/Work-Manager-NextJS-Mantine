'use server';

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || 'http://localhost:3000/'

export async function signInWithGithub() {
  const supabase = await createClient()
  const provider = 'github'

  console.log('rootUrl', rootUrl)

  const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `${rootUrl}auth/callback`,
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
