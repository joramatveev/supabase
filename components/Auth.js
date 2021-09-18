import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const handleChange = (event) => {
        setError('');
        setMessage('');
        setSubmitted(false);
        const { name, value } = event.target;
        switch (name) {
            case 'email':
                setEmail(value);
                break;
        }
    }

    /**
     *
     * @param email
     * @returns {Promise<void>}
     */
    const handleLogin = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')
        setSubmitted(true)
        setLoading(true)
        try {
            const { error } = await supabase.auth.signIn({ email })
            if (error) {
                throw error
                // setError(`${error.error_description || error.message}`);
            }
            setMessage('Check your email for the login link!')
        } catch (error) {
            setError(`${error.error_description || error.message}`);
        } finally {
            setLoading(false)
            //setSubmitted(false)
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <div className="row flex flex-center">
                <div className="col-6 form-widget text-center">
                    <h1 className="header">Supabase + Next.js</h1>
                    <p className="description">Sign in via magic link with your email below</p>
                    <div>
                        <input
                            className={"inputField" + (submitted && !email ? ' has-error' : '') + (message ? ' has-success' : '') }
                            type="email"
                            placeholder="Your email"
                            value={email}
                            name="email"
                            id="email"
                            onChange={(e) => handleChange(e)}
                        />
                    </div>
                    <div>
                        <button
                            onClick={(e) => handleLogin(e)}
                            className="button block"
                            disabled={loading}
                        >
                            <span>{loading ? 'Loading' : 'Send magic link'}</span>
                        </button>
                    </div>
                    {(error || message) &&
                    <div
                        className={'alert ' + (error ? ' alert-danger' : '') + (message ? ' alert-success' : '')}>{error}{message}</div>
                    }
                </div>
            </div>
        </form>
    )
}