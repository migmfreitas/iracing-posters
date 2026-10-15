import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App.tsx'

// The admin page is only for whoever maintains the catalogue, so it loads on demand.
const Admin = lazy(() => import('./admin/Admin.tsx'))

const isAdmin = () => window.location.hash.startsWith('#/admin')

export default function Root() {
  const [admin, setAdmin] = useState(isAdmin)
  useEffect(() => {
    const onHash = () => setAdmin(isAdmin())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return admin ? (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  ) : (
    <App />
  )
}
