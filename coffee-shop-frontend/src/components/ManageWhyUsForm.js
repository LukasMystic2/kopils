import React, { useState, useEffect } from 'react';

const ManageWhyUsForm = ({ initialData, onUpdate, showNotification }) => {
    const defaultImageUrl = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2938&auto-format=fit=crop';
    
    const [highlights, setHighlights] = useState([
        { title: 'Single Origin', description: 'All our beans come from the renowned coffee region of Dampit, ensuring consistent quality and taste.' },
        { title: 'Natural Process', description: 'We use traditional, natural processing methods that enhance the coffee\'s inherent flavors without additives.' },
        { title: 'Community Focused', description: 'We work directly with local farmers, supporting the community and ensuring fair practices.' },
    ]);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = `${process.env.SERVER_URL}`;

    useEffect(() => {
        if (initialData) {
            setImageUrl(initialData.imageUrl || defaultImageUrl);
            if (initialData.details && Array.isArray(initialData.details) && initialData.details.length === 3) {
                setHighlights(initialData.details);
            }
        }
    }, [initialData, defaultImageUrl]);

    const handleHighlightChange = (index, field, value) => {
        const newHighlights = [...highlights];
        newHighlights[index][field] = value;
        setHighlights(newHighlights);
    };

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
            section: 'whyUs',
            details: highlights,
            imageUrl: finalImageUrl
        };

        try {
            const response = await fetch(`${API_URL}/api/content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentData),
            });

            if (!response.ok) throw new Error('Gagal memperbarui bagian "Why Us"');
            showNotification('Bagian "Why Us" berhasil diperbarui!');
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
            <h3 className="text-xl font-bold text-amber-400 mb-6">💡 Kelola Bagian "Mengapa Kami"</h3>
            <div className="space-y-4">
                {highlights.map((highlight, index) => (
                    <div key={index} className="p-4 border border-gray-700/50 rounded-lg bg-gray-900/30">
                        <h4 className="text-md font-semibold text-amber-500 mb-2">Sorotan {index + 1}</h4>
                        <input type="text" placeholder="Judul Sorotan" value={highlight.title} onChange={(e) => handleHighlightChange(index, 'title', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                        <textarea placeholder="Deskripsi Sorotan" value={highlight.description} onChange={(e) => handleHighlightChange(index, 'description', e.target.value)} style={{...inputStyle, marginTop: '8px'}} rows="2" onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                    </div>
                ))}
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan Bagian "Why Us"'}
            </button>
        </form>
    );
};

export default ManageWhyUsForm;
