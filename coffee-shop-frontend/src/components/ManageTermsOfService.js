import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// --- Style untuk Animasi ---
const animationStyle = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const editorConfiguration = {
    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'blockQuote', 'insertTable', 'undo', 'redo']
};

const ManageTermsOfService = ({ showNotification }) => {
    const API_URL = process.env.REACT_APP_SERVER_URL;
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State untuk efek hover
    const [submitHover, setSubmitHover] = useState(false);

    useEffect(() => {
        const fetchTermsOfService = async () => {
            try {
                const response = await fetch(`${API_URL}/api/terms-of-service`);
                if (!response.ok) throw new Error('Gagal mengambil ketentuan layanan.');
                const data = await response.json();
                setContent(data.content || '');
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchTermsOfService();
    }, [API_URL, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/terms-of-service`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) throw new Error('Gagal memperbarui ketentuan layanan.');
            showNotification('Ketentuan Layanan berhasil diperbarui! 📝');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Objek Gaya Inline ---
    const formSectionStyle = {
        transition: 'all 0.5s ease-in-out',
        borderLeft: '4px solid #FBBF24', // amber-400
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    };

    const buttonBaseStyle = {
        transition: 'all 0.3s ease',
        transform: 'scale(1)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer'
    };
    
    const buttonHoverStyle = {
        transform: 'scale(1.05)',
        boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
    };

    const loadingSpinnerStyle = {
        border: '4px solid rgba(251, 191, 36, 0.3)',
        borderTop: '4px solid #FBBF24',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div style={loadingSpinnerStyle}></div>
                <p className="text-amber-400 text-lg">Memuat konten...</p>
            </div>
        );
    }

    return (
        <div>
            <style>{animationStyle}</style>
            <form onSubmit={handleSubmit} style={formSectionStyle} className="bg-gray-800 p-6 rounded-lg space-y-6">
                <h3 className="text-2xl font-bold text-amber-400 mb-4" style={{ letterSpacing: '1px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    📄 Ketentuan Layanan
                </h3>
                
                <div className="text-white rounded-lg overflow-hidden border border-gray-600" style={{ animation: `fadeInUp 0.5s ease-out 0.1s forwards`, opacity: 0 }}>
                    <CKEditor
                        editor={ClassicEditor}
                        config={editorConfiguration}
                        data={content}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setContent(data);
                        }}
                    />
                </div>
                
                <div className="pt-4" style={{ animation: `fadeInUp 0.5s ease-out 0.2s forwards`, opacity: 0 }}>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{ ...buttonBaseStyle, ...(submitHover ? buttonHoverStyle : {}) }}
                        onMouseEnter={() => setSubmitHover(true)}
                        onMouseLeave={() => setSubmitHover(false)}
                        className="w-full bg-amber-600 text-white font-bold p-3 rounded-lg hover:bg-amber-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageTermsOfService;
