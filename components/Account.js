import { useEffect, useState, useRef } from 'react'
import Link from "next/link";
import { supabase } from '../utils/supabaseClient'

import Avatar from '../components/Avatar'

export default function Account({ session }) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [username, setUsername] = useState(null)
    const [website, setWebsite] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)

    const [created_at, setCreatedAt] = useState('')
    const [updated_at, setUpdatedAt] = useState('')

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const updateActionRef = useRef(null);

    useEffect(() => {
        setError('');
        setMessage('');
        setSubmitted(false);

        return getProfile()
    }, [session])

    const handleChange = (event) => {
        setError('');
        setMessage('');
        setSubmitted(false);
        const { name, value } = event.target;
        switch (name) {
            case 'username':
                setUsername(value);
                break;
            case 'website':
                setWebsite(value);
                break;
        }
    }

    const prepareDate = (str) => {
        let createdAtParts = str.split('.')
        createdAtParts = createdAtParts[0]
        return createdAtParts.replace('T', ' ')
    }

    async function getProfile() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url, updated_at, created_at`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
                setCreatedAt(prepareDate(data.created_at))
                setUpdatedAt(prepareDate(data.updated_at))
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile(event) {
        event.preventDefault()
        try {
            setError('');
            setMessage('');

            setLoading(true)
            setSubmitted(true);

            const user = supabase.auth.user()

            const updates = {
                id: user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date().toISOString(),
            }

            setUpdatedAt(prepareDate(updates.updated_at.toString()))

            let { error } = await supabase.from('profiles').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                throw error
            }

            setMessage('Data saved successfully')

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
        return ;
    }

    let interval;

    if (!!error || !!message) {
        interval = setInterval(() => {
            setError('');
            setMessage('');
            setSubmitted(false);
            clearInterval(interval)
        }, 5000)
    }

    return (
        <div className="form-widget">
            <form onSubmit={updateProfile}>
                <div className={'row'}>
                    <div className={'form-widget-header'}>
                        <div className={'row'}>
                            <div className={'col-6'}>
                                <h1 className="header">Profile</h1>
                            </div>
                            <div className={'col-6 text-right'}>
                                <Link href="/KYC">
                                    <button className="button">
                                        KYC
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-9">
                        <div>
                            <label htmlFor="username">Name</label>
                            <input
                                className={"inputField" + (submitted && !username ? ' has-error' : '') + (message ? ' has-success' : '')}
                                id="username"
                                name="username"
                                type="text"
                                value={username || ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div>
                            <label htmlFor="website">Website</label>
                            <input
                                className={"inputField" + (message ? ' has-success' : '')}
                                id="website"
                                name="website"
                                type="website"
                                value={website || ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="text" value={session.user.email} disabled={true} />
                        </div>
                        {created_at && <div>
                            <label htmlFor="created_at">Created at</label>
                            <input id="created_at" type="text" value={created_at} disabled={true} />
                        </div>}
                        {updated_at && <div>
                            <label htmlFor="updated_at">Updated at</label>
                            <input id="updated_at" type="text" value={updated_at} disabled={true} />
                        </div>}
                    </div>
                    <div className="col-3">
                        <Avatar
                            url={avatar_url}
                            size={150}
                            onUpload={(url) => {
                                setAvatarUrl(url)
                                updateActionRef.current.click()
                            }}
                        />
                    </div>
                </div>

                <div className={'row'}>
                    <div className={'col-6'}>
                        <button
                            ref={updateActionRef}
                            id="updateAction"
                            className="button block primary"
                            onClick={(e) => updateProfile(e)}
                            disabled={loading}
                        >
                            {loading ? 'Loading ...' : 'Update'}
                        </button>
                    </div>

                    <div className={'col-6'}>
                        <button className="button block" onClick={() => supabase.auth.signOut()}>
                            Sign Out
                        </button>
                    </div>
                </div>

                {(error || message) &&
                <div
                    id="alert"
                    className={'alert ' + (error ? ' alert-danger' : '') + (message ? ' alert-success' : '')}>{error}{message}</div>
                }
            </form>
        </div>
    )
}
