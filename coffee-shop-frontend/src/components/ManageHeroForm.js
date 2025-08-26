import React, { useState, useEffect } from 'react';

const defaultSlides = [
    { title: "Kopi LS", tagline: "Cita Rasa Kopi Alami", imageUrl: "https://www.treatt.com/media/pages/news/the-journey-of-the-coffee-bean/3bd4677a46-1746605375/shutterstock-1707181633-1-1440x720-crop-q70.jpg" },
    { title: "Pure Robusta", tagline: "Directly from the Heart of Dampit", imageUrl: "https://www.nescafe.com/gb/sites/default/files/2023-11/Untitled-5%20copy_6.jpg" },
    { title: "Naturally Processed", tagline: "Authentic Flavor in Every Sip", imageUrl: "https://5.imimg.com/data5/SELLER/Default/2021/8/AP/WL/GJ/5504430/roasted-coffee-beans.jpg" }
];

const ManageHeroForm = ({ initialData, onUpdate, showNotification }) => {
    const [slides, setSlides] = useState(defaultSlides);
    const [imageFiles, setImageFiles] = useState([null, null, null]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = process.env.REACT_APP_SERVER_URL;

    useEffect(() => {
        if (initialData && initialData.details && Array.isArray(initialData.details)) {
            const dbSlides = initialData.details;
            const filledSlides = defaultSlides.map((slide, index) => ({
                ...defaultSlides[index],
                ...dbSlides[index],
                imageUrl: dbSlides[index]?.imageUrl || defaultSlides[index]?.imageUrl
            }));
            setSlides(filledSlides);
        }
    }, [initialData]);

    const handleSlideChange = (index, field, value) => {
        const newSlides = [...slides];
        newSlides[index][field] = value;
        setSlides(newSlides);
    };

    const handleFileChange = (index, file) => {
        const newFiles = [...imageFiles];
        newFiles[index] = file;
        setImageFiles(newFiles);
        handleSlideChange(index, 'imageUrl', '');
    };

    const handleRemoveImage = (index) => {
        const defaultImage = defaultSlides[index].imageUrl;
        handleSlideChange(index, 'imageUrl', defaultImage);
        const newFiles = [...imageFiles];
        newFiles[index] = null;
        setImageFiles(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const newSlidesData = [...slides];

        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                if (file && file.size > 0) {
                    const formData = new FormData();
                    formData.append('images', file);
                    
                    const response = await fetch(`${API_URL}/api/content/hero/upload/images`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) throw new Error('Gagal mengunggah gambar');
                    const result = await response.json();
                    newSlidesData[i].imageUrl = result.urls[0];
                }
            }

            const response = await fetch(`${API_URL}/api/content/hero`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides: newSlidesData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memperbarui bagian Hero');
            }
            showNotification('Bagian Hero berhasil diperbarui!');
            onUpdate();
            setImageFiles([null, null, null]);

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
            <h3 className="text-xl font-bold text-amber-400 mb-6">🖼️ Kelola Karosel Hero</h3>
            <div className="space-y-6">
                {slides.map((slide, index) => (
                    <div key={index} className="p-4 border border-gray-700/50 rounded-lg space-y-4 bg-gray-900/30">
                        <h4 className="text-md font-semibold text-amber-500">Slide {index + 1}</h4>
                        <input type="text" placeholder="Judul" value={slide.title} onChange={(e) => handleSlideChange(index, 'title', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                        <input type="text" placeholder="Tagline" value={slide.tagline} onChange={(e) => handleSlideChange(index, 'tagline', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                        <input type="file" onChange={(e) => handleFileChange(index, e.target.files[0])} className={fileInputStyle} />
                        {slides[index].imageUrl && (
                            <div className="mt-2 flex items-center gap-4">
                                <img src={slides[index].imageUrl} alt={`Slide ${index+1}`} className="h-20 w-20 object-cover rounded-md border-2 border-gray-700" />
                                <button type="button" onClick={() => handleRemoveImage(index)} className="text-sm bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 transition-all transform hover:scale-105">Hapus Gambar</button>
                            </div>
                        )}
                    </div>
                ))}
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Hero'}
            </button>
        </form>
    );
};

export default ManageHeroForm;
