import React, { useState, useEffect } from 'react';

const ManageContentForm = ({ sectionId, initialData, label, hasTitle = false, hasCite = false, onUpdate, showNotification }) => {
    const defaultImageUrls = {
        description: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?q=80&w=2938&auto-format=fit=crop',
        quote: 'https://images.unsplash.com/photo-1525095362582-53733b661365?q=80&w=2835&auto=format&fit=crop',
        whyUs: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2938&auto-format=fit=crop'
    };
    const defaultImageUrl = defaultImageUrls[sectionId];

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [cite, setCite] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = process.env.REACT_APP_SERVER_URL;

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setText(initialData.text || '');
            setCite(initialData.cite || '');
            setImageUrl(initialData.imageUrl || defaultImageUrl);
        }
    }, [initialData, defaultImageUrl]);

    const handleRemoveImage = () => {
        setImageUrl(defaultImageUrl);
        setImageFile(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        let finalImageUrl = imageUrl;

        if (imageFile) {
            try {
                const formData = new FormData();
                formData.append('image', imageFile);

                const response = await fetch(`${API_URL}/api/content/upload/image`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) throw new Error('Gagal mengunggah gambar');
                const result = await response.json();
                finalImageUrl = result.url;
            } catch (error) {
                showNotification(error.message, 'error');
                setIsSubmitting(false);
                return;
            }
        }
        
        const contentData = {
            section: sectionId,
            title: hasTitle ? title : undefined,
            text: text,
            cite: hasCite ? cite : undefined,
            imageUrl: finalImageUrl
        };

        try {
            const response = await fetch(`${API_URL}/api/content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentData),
            });

            if (!response.ok) throw new Error(`Gagal memperbarui ${label}`);
            showNotification(`Bagian '${label}' berhasil diperbarui!`);
            onUpdate();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '2px solid transparent',
        borderRadius: '8px',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        color: 'white',
        transition: 'all 0.3s ease',
    };
    
    const fileInputStyle = "block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-amber-400 hover:file:bg-gray-600 transition-colors cursor-pointer";

    return (
        <form 
            onSubmit={handleSubmit} 
            style={{
                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.5), rgba(17, 24, 39, 0.5))',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <h3 className="text-xl font-bold text-amber-400 mb-6">📝 Kelola Bagian {label}</h3>
            <div className="space-y-4">
                {hasTitle && <input type="text" placeholder="Judul Bagian" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />}
                <textarea placeholder="Teks Utama / Kutipan" value={text} onChange={(e) => setText(e.target.value)} style={inputStyle} rows="4" onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                {hasCite && <input type="text" placeholder="Penulis Kutipan / Sumber" value={cite} onChange={(e) => setCite(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />}
            </div>
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">🖼️ Gambar Latar Belakang</label>
                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className={fileInputStyle} />
                {imageUrl && !imageFile && (
                    <div className="mt-4 flex items-center gap-4">
                        <img src={imageUrl} alt="Current" className="h-20 w-20 object-cover rounded-md border-2 border-gray-700"/>
                        <button type="button" onClick={handleRemoveImage} className="text-sm bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 transition-all transform hover:scale-105">Hapus Gambar</button>
                    </div>
                )}
            </div>
            <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full mt-6 text-white p-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                }}
            >
                {isSubmitting ? 'Menyimpan...' : `Simpan ${label}`}
            </button>
        </form>
    );
};

export default ManageContentForm;
