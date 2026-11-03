import { useEffect, useState } from 'react'
import Menu from './pages/Menu.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash.startsWith('#/admin') ? <Admin /> : <Menu />
}
