import { useEffect, useState } from 'react'
import Image from  'next/image'
import { supabase } from '../utils/supabaseClient'

export default function Doc({ url, size, onUpload }) {
    const [docUrl, setDocUrl] = useState(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (url) {
            downloadImage(url)
        }
    }, [url])

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage.from('docs').download(path)
            if (error) {
                throw error
            }
            const url = URL.createObjectURL(data)
            setDocUrl(url)
        } catch (error) {
            console.log('Error downloading image: ', error.message)
        }
    }

    async function uploadDoc(event) {
        event.preventDefault(event)
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            let { error: uploadError } = await supabase.storage
                .from('docs')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            onUpload(filePath)
        } catch (error) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            {docUrl ? (
                <Image
                    src={docUrl}
                    alt="Doc"
                    className="doc image"
                    width="100%" height="100%"
                    layout="responsive" objectFit="contain"
                />
            ) : (
                <div className="avatar no-image" style={{ height: size, width: size }} />
            )}
            <div style={{ width: size }}>
                <label className="button primary block" htmlFor="single">
                    {uploading ? 'Uploading ...' : 'Upload doc'}
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={(e) => uploadDoc(e)}
                    disabled={uploading}
                />
            </div>
        </div>
    )
}