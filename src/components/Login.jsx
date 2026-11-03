import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-coffee px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-cream p-6">
        <h1 className="text-center font-display text-3xl font-bold text-espresso">لوحة تحكم قهوتنا</h1>
        <input className="field" type="email" placeholder="البريد الإلكتروني" value={email}
          onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
        <input className="field" type="password" placeholder="كلمة المرور" value={password}
          onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
        {err && <p className="text-sm text-red-800">{err}</p>}
        <button className="btn btn-main w-full" disabled={busy}>{busy ? 'جاري الدخول…' : 'تسجيل الدخول'}</button>
      </form>
    </div>
  )
}
