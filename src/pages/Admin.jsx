import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import Login from '../components/Login.jsx'
import CategoryManager from '../components/CategoryManager.jsx'
import ProductManager from '../components/ProductManager.jsx'

export default function Admin() {
  const [session, setSession] = useState(undefined)
  const [isAdmin, setIsAdmin] = useState(null)
  const [tab, setTab] = useState('products')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return setIsAdmin(null)
    supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [session])

  if (session === undefined) return null
  if (!session) return <Login />

  const out = <button className="btn btn-soft" onClick={() => supabase.auth.signOut()}><LogOut size={16} />خروج</button>
  if (isAdmin === null) return null
  if (!isAdmin) return (
    <div className="mx-auto min-h-screen max-w-md bg-cream p-8 text-center space-y-4">
      <p className="text-red-800">هذا الحساب ليس لديه صلاحية إدارة القائمة.</p>{out}
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between bg-coffee px-4 py-3 text-cream">
        <h1 className="font-display text-2xl font-bold">قهوتنا · الإدارة</h1>
        {out}
      </header>
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-beige p-1">
          {[['products', 'الأصناف'], ['categories', 'الأقسام']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-lg py-2 font-semibold ${tab === k ? 'bg-espresso text-cream' : 'text-espresso'}`}>{label}</button>
          ))}
        </div>
        {tab === 'products' ? <ProductManager /> : <CategoryManager />}
      </div>
    </div>
  )
}
