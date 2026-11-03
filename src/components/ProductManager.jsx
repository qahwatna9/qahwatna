import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { supabase, money } from '../lib/supabase.js'

const empty = { name: '', description: '', price: '', category_id: '', image_url: '', is_available: true, display_order: 0 }

export default function ProductManager() {
  const [cats, setCats] = useState([])
  const [list, setList] = useState([])
  const [form, setForm] = useState(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const [c, p] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('products').select('*').order('display_order')
    ])
    setCats(c.data || []); setList(p.data || [])
  }
  useEffect(() => { load() }, [])

  const open = (p) => { setFile(null); setMsg(''); setForm(p || { ...empty, category_id: cats[0]?.id || '', display_order: list.length + 1 }) }

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('')
    let image_url = form.image_url
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${crypto.randomUUID()}.${ext}`
      const up = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type })
      if (up.error) { setBusy(false); return setMsg('تعذر رفع الصورة: ' + up.error.message) }
      image_url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    }
    const row = {
      name: form.name.trim(), description: form.description?.trim() || null, price: Number(form.price),
      category_id: form.category_id, image_url, is_available: form.is_available,
      display_order: Number(form.display_order) || 0
    }
    const { error } = form.id
      ? await supabase.from('products').update(row).eq('id', form.id)
      : await supabase.from('products').insert(row)
    setBusy(false)
    if (error) return setMsg('تعذر الحفظ: ' + error.message)
    setForm(null); load()
  }

  const remove = async (p) => {
    if (!confirm(`حذف "${p.name}"؟`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) setMsg('تعذر الحذف: ' + error.message); else load()
  }

  const toggle = async (p) => {
    await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id); load()
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-4">
      <button className="btn btn-main" disabled={!cats.length} onClick={() => open()}><Plus size={16} />صنف جديد</button>
      {!cats.length && <p className="text-sm">أضف قسماً أولاً من تبويب الأقسام.</p>}
      {msg && <p className="text-sm text-red-800">{msg}</p>}

      {form && (
        <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-4">
          <input className="field" placeholder="اسم الصنف" value={form.name} required onChange={set('name')} />
          <textarea className="field" rows={2} placeholder="الوصف (اختياري)" value={form.description || ''} onChange={set('description')} />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">السعر (ج.م)
              <input className="field mt-1" type="number" min="0" step="0.5" required value={form.price} onChange={set('price')} /></label>
            <label className="text-sm">الترتيب
              <input className="field mt-1" type="number" value={form.display_order} onChange={set('display_order')} /></label>
          </div>
          <label className="block text-sm">القسم
            <select className="field mt-1" value={form.category_id} required onChange={set('category_id')}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
          <label className="block text-sm">الصورة
            {form.image_url && !file && <img src={form.image_url} alt="" className="my-2 h-20 w-20 rounded-lg object-cover" />}
            <input className="field mt-1" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_available}
            onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />متاح للزبائن</label>
          <div className="flex gap-2">
            <button className="btn btn-main" disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ'}</button>
            <button type="button" className="btn btn-soft" onClick={() => setForm(null)}>إلغاء</button>
          </div>
        </form>
      )}

      {cats.map((c) => (
        <section key={c.id}>
          <h2 className="mb-2 font-display text-xl font-bold text-espresso">{c.name}</h2>
          <ul className="space-y-2">
            {list.filter((p) => p.category_id === c.id).map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                {p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  : <div className="h-12 w-12 rounded-lg bg-beige" />}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-sm text-espresso/70">{money(p.price)}</p>
                </div>
                <button onClick={() => toggle(p)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${p.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {p.is_available ? 'متاح' : 'مخفي'}</button>
                <button className="btn btn-soft !p-2" aria-label="تعديل" onClick={() => open(p)}><Pencil size={16} /></button>
                <button className="btn btn-danger !p-2" aria-label="حذف" onClick={() => remove(p)}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
