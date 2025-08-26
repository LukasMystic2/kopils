import React, { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';

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
`;

const ManagePaymentInfo = ({ showNotification }) => {
    const API_URL = `${process.env.SERVER_URL}`;
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    const { data: initialData } = useFetch(`${API_URL}/api/payment-info`);

    const [qrisImageFile, setQrisImageFile] = useState(null);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [existingQris, setExistingQris] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk efek hover
    const [submitHover, setSubmitHover] = useState(false);
    const [removeHover, setRemoveHover] = useState(false);


    useEffect(() => {
        if (initialData) {
            setBankName(initialData.bankName || '');
            setAccountNumber(initialData.accountNumber || '');
            setAccountName(initialData.accountName || '');
            setExistingQris(initialData.qrisImageUrl || '');
        }
    }, [initialData]);

    const handleRemoveImage = () => {
        setExistingQris('');
        setQrisImageFile(null);
        // Reset file input
        const fileInput = document.getElementById('qris-image-input');
        if(fileInput) fileInput.value = '';
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        let finalImageUrl = existingQris;

        if (qrisImageFile && qrisImageFile.size > 0) {
            try {
                const formData = new FormData();
                formData.append('qrisImage', qrisImageFile);

                const response = await fetch(`${API_URL}/api/payment-info/upload/qrisImage`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                
                if (!response.ok) throw new Error('Gagal mengunggah gambar QRIS');
                const result = await response.json();
                finalImageUrl = result.url;
            } catch (error) {
                showNotification(error.message, 'error');
                setIsSubmitting(false);
                return;
            }
        }

        const paymentData = {
            bankName: bankName,
            accountNumber: accountNumber,
            accountName: accountName,
            qrisImageUrl: finalImageUrl
        };
        
        try {
            const response = await fetch(`${API_URL}/api/payment-info`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentData),
            });
            if (!response.ok) throw new Error('Gagal memperbarui info pembayaran');
            showNotification('Info pembayaran berhasil diperbarui! 💳');
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
    
    const inputStyle = {
        transition: 'all 0.3s ease-in-out',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
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

    return (
        <div>
            <style>{animationStyle}</style>
            <form onSubmit={handleSubmit} style={formSectionStyle} className="bg-gray-800 p-6 rounded-lg space-y-6">
                <h3 className="text-2xl font-bold text-amber-400 mb-4" style={{ letterSpacing: '1px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    🏦 Informasi Pembayaran
                </h3>

                {/* QRIS Image Section */}
                <div style={{ animation: `fadeInUp 0.5s ease-out 0.1s forwards`, opacity: 0 }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gambar QRIS</label>
                    <input id="qris-image-input" type="file" onChange={(e) => setQrisImageFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-700 file:text-amber-400 hover:file:bg-gray-600 cursor-pointer"/>
                    
                    <div className="mt-4">
                        {qrisImageFile ? (
                             <div className="relative w-40 h-40">
                                <img src={URL.createObjectURL(qrisImageFile)} alt="Preview QRIS" className="h-full w-full object-contain rounded-lg" />
                             </div>
                        ) : existingQris && (
                            <div className="relative w-40 h-40">
                                <img src={existingQris} alt="QRIS Tersimpan" className="h-full w-full object-contain rounded-lg" />
                                <button 
                                    type="button" 
                                    onClick={handleRemoveImage}
                                    style={{ ...buttonBaseStyle, ...(removeHover ? buttonHoverStyle : {}) }}
                                    onMouseEnter={() => setRemoveHover(true)}
                                    onMouseLeave={() => setRemoveHover(false)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold hover:bg-red-500">
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bank Info Section */}
                <div className="space-y-4" style={{ animation: `fadeInUp 0.5s ease-out 0.2s forwards`, opacity: 0 }}>
                    <input type="text" placeholder="Nama Bank (cth: BCA)" value={bankName} onChange={(e) => setBankName(e.target.value)} style={inputStyle} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    <input type="text" placeholder="Nomor Rekening" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={inputStyle} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    <input type="text" placeholder="Nama Pemilik Rekening" value={accountName} onChange={(e) => setAccountName(e.target.value)} style={inputStyle} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>

                {/* Submit Button */}
                <div className="pt-4" style={{ animation: `fadeInUp 0.5s ease-out 0.3s forwards`, opacity: 0 }}>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        style={{ ...buttonBaseStyle, ...(submitHover ? buttonHoverStyle : {}) }}
                        onMouseEnter={() => setSubmitHover(true)}
                        onMouseLeave={() => setSubmitHover(false)}
                        className="w-full bg-amber-600 text-white font-bold p-3 rounded-lg hover:bg-amber-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Informasi Pembayaran'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManagePaymentInfo;
