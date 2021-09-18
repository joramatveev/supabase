import { useEffect, useRef, useState } from 'react'
import Link from "next/link";
import { supabase } from '../utils/supabaseClient'

import Doc from '../components/Doc'

export default function KYC({ session }) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [id, setId] = useState(null)
    const [first_name, setFirstName] = useState(null)
    const [last_name, setLastName] = useState(null)
    const [phone, setPhone] = useState(null)
    const [country, setCountry] = useState(null)
    const [city, setCity] = useState(null)
    const [doc_url, setDocUrl] = useState(null)

    const [created_at, setCreatedAt] = useState('')
    const [updated_at, setUpdatedAt] = useState('')

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const updateActionRef = useRef(null);

    useEffect(() => {
        setError('');
        setMessage('');
        setSubmitted(false);

        getInformation()
    }, [session])

    const handleChange = (event) => {
        setError('');
        setMessage('');
        setSubmitted(false);
        const { name, value } = event.target;
        switch (name) {
            case 'first_name':
                setFirstName(value);
                break;
            case 'last_name':
                setLastName(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            case 'country':
                setCountry(value);
                break;
            case 'city':
                setCity(value);
                break;
        }
    }

    const prepareDate = (str) => {
        let createdAtParts = str.split('.')
        createdAtParts = createdAtParts[0]
        return createdAtParts.replace('T', ' ')
    }

    async function getInformation() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('information')
                .select(`id, first_name, last_name, phone, country, city, doc_url, updated_at, created_at`)
                .eq('profile_id', user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setId(data.id)
                setFirstName(data.first_name)
                setLastName(data.last_name)
                setPhone(data.phone)
                setCountry(data.country)
                setCity(data.city)
                setCreatedAt(prepareDate(data.created_at))
                setUpdatedAt(prepareDate(data.updated_at))
                setDocUrl(data.doc_url)
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile(event) {
        console.log(event)
        event.preventDefault()
        try {
            setError('');
            setMessage('');

            setLoading(true)
            setSubmitted(true);

            const user = supabase.auth.user()

            const updates = {
                profile_id: user.id,
                first_name,
                last_name,
                phone,
                country,
                city,
                updated_at: new Date().toISOString(),
                doc_url
            }

            if (id !== null) {
                updates.id = id;
            }

            setUpdatedAt(prepareDate(updates.updated_at.toString()))

            let { error } = await supabase.from('information').upsert(updates, {
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
                                <h1 className="header">KYC</h1>
                            </div>
                            <div className={'col-6 text-right'}>
                                <Link href="/">
                                    <button className="button">
                                        Profile
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-9">
                        <div>
                            <label htmlFor="first_name">First name</label>
                            <input
                                className={"inputField" + (submitted && !first_name ? ' has-error' : '') + (message ? ' has-success' : '')}
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={first_name || ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name">Last name</label>
                            <input
                                className={"inputField" + (submitted && !last_name ? ' has-error' : '') + (message ? ' has-success' : '')}
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={last_name || ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone">Phone</label>
                            <input
                                className={"inputField" + (submitted && !phone ? ' has-error' : '') + (message ? ' has-success' : '')}
                                id="phone"
                                name="phone"
                                type="text"
                                value={phone || ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div>
                            <label htmlFor="country">Country</label>
                            <input
                                className={"inputField" + (submitted && !country ? ' has-error' : '') + (message ? ' has-success' : '')}
                                id="country"
                                name="country"
                                type="text"
                                value={country || ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div>
                            <label htmlFor="city">City</label>
                            <input
                                className={"inputField" + (submitted && !city ? ' has-error' : '') + (message ? ' has-success' : '')}
                                id="city"
                                name="city"
                                type="text"
                                value={city || ''}
                                onChange={(e) => handleChange(e)}
                            />
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
                        <Doc
                            url={doc_url}
                            size={150}
                            onUpload={(url) => {
                                setDocUrl(url)
                                updateActionRef.current.click()
                            }}
                        />
                    </div>
                </div>

                <div className={'row'}>
                    <div className={'col-6'}>
                        <button
                            ref={updateActionRef}
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
