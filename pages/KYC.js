import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import Auth from '../components/Auth'
import KYC from '../components/KYC'

export default function KYCPage() {
    const [session, setSession] = useState(null)

    useEffect(() => {
        setSession(supabase.auth.session())
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])

    return (
        <div className="container" style={{ padding: '50px 0 100px 0' }}>
            {!session ? <Auth /> : <KYC key={session.user.id} session={session} />}
        </div>
    )
}