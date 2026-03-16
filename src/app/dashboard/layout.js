import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard Sposi — Matteo & Clio',
}

export default async function DashboardLayout({ children }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
