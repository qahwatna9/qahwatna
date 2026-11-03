import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { SPRITE, pickArt } from '../lib/illustrations.js'
import Art from '../components/Art.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Menu() {
  const [cats, setCats] = useState([])
  const [products, setProducts] = useState([])
  const [active, setActive] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('products').select('*').order('display_order')
      ])
      if (c.error || p.error) return setState('error')
      setCats(c.data); setProducts(p.data); setActive(c.data[0]?.id ?? null); setState('ok')
    })()
  }, [])

  const current = cats.find((c) => c.id === active)
  const shown = products.filter((p) => p.category_id === active)

  return (
    <div className="app">
      <div style={{ position: 'absolute', width: 0, height: 0 }} dangerouslySetInnerHTML={{ __html: SPRITE }} />
      <div className="top">
        <span className="logo">قهوتنا</span>
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M8 20h26v9a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 29V20Z" /><path d="M34 23h3a4 4 0 0 1 0 8h-3" />
          <path d="M16 6c-2 3 2 4 0 8M24 6c-2 3 2 4 0 8" />
        </svg>
      </div>
      <div className="hero"><div className="banner">
        <h2>نوّرتنا في قهوتنا</h2><p>اتفرّج على المنيو واختار مزاجك</p>
        <Art id="shisha" className="a" /><Art id="coffee" className="b" />
      </div></div>

      <div className="cats"><div className="cbar">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} className={`c ${active === c.id ? 'on' : ''}`}>
            <div className="ic"><Art id={pickArt(c.name)} /></div><span>{c.name}</span>
          </button>
        ))}
      </div></div>

      <main>
        {current && <h2 className="t">{current.name}</h2>}
        {state === 'loading' && <p className="note">جاري التحميل…</p>}
        {state === 'error' && <p className="note" style={{ color: '#991b1b' }}>مقدرناش نحمّل المنيو. جرّب تاني بعد شوية.</p>}
        {state === 'ok' && shown.length === 0 && <p className="note">مفيش أصناف في القسم ده دلوقتي.</p>}
        <div className="grid" key={active}>
          {shown.map((p, i) => <ProductCard key={p.id} product={p} categoryName={current?.name} index={i} />)}
        </div>
      </main>
    </div>
  )
}
