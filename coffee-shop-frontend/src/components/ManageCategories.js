import React, { useState, useEffect, useCallback } from 'react';

// --- Style untuk Animasi ---
// Menambahkan keyframes untuk animasi staggered (muncul satu per satu)
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
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;

const ManageCategories = ({ showNotification = () => {} }) => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const API_URL = process.env.REACT_APP_SERVER_URL;

    // State untuk menangani efek hover pada tombol secara inline
    const [submitHover, setSubmitHover] = useState(false);
    const [cancelHover, setCancelHover] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            if (!response.ok) throw new Error('Gagal memuat kategori.');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            showNotification(error.message, 'error');
            console.error("Gagal memuat kategori:", error);
        }
    }, [API_URL, showNotification]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            showNotification('Nama kategori tidak boleh kosong.', 'error');
            return;
        }
        const isEditing = !!editingCategory;
        const url = isEditing ? `${API_URL}/api/categories/${editingCategory._id}` : `${API_URL}/api/categories`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error(`Gagal ${isEditing ? 'memperbarui' : 'membuat'} kategori`);
            showNotification(`Kategori berhasil ${isEditing ? 'diperbarui' : 'dibuat'}! 🎉`);
            setName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak bisa dibatalkan.')) {
            try {
                const response = await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal menghapus kategori');
                }
                showNotification('Kategori berhasil dihapus! 🗑️');
                fetchCategories();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };
    
    const handleEditClick = (cat) => {
        setEditingCategory(cat); 
        setName(cat.name);
        // Scroll ke atas agar form terlihat
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setName('');
    }

    // --- Objek Gaya Inline untuk UI yang lebih dinamis ---
    const formSectionStyle = {
        transition: 'all 0.5s ease-in-out',
        borderLeft: '4px solid #FBBF24', // amber-400
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        transform: editingCategory ? 'scale(1.02)' : 'scale(1)',
        animation: editingCategory ? 'pulse 2s infinite' : 'none',
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
        <div className="space-y-12">
            <style>{animationStyle}</style>
            
            <section style={formSectionStyle} className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700">
                <h3 className="text-2xl font-bold text-amber-400 mb-6" style={{ letterSpacing: '1px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {editingCategory ? `📝 Ubah Kategori: ${editingCategory.name}` : '✨ Tambah Kategori Baru'}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
                    <input 
                        type="text" 
                        placeholder="Nama Kategori..." 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        style={inputStyle}
                        className="flex-grow p-3 border rounded-lg w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
                        required 
                    />
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            type="submit"
                            style={{ ...buttonBaseStyle, ...(submitHover ? buttonHoverStyle : {}) }}
                            onMouseEnter={() => setSubmitHover(true)}
                            onMouseLeave={() => setSubmitHover(false)}
                            className="flex-1 bg-amber-600 text-white font-bold p-3 rounded-lg hover:bg-amber-500">
                            {editingCategory ? 'Perbarui' : 'Tambah'}
                        </button>
                        {editingCategory && (
                            <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                style={{ ...buttonBaseStyle, ...(cancelHover ? buttonHoverStyle : {}) }}
                                onMouseEnter={() => setCancelHover(true)}
                                onMouseLeave={() => setCancelHover(false)}
                                className="flex-1 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-500">
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section>
                <h3 className="text-2xl font-bold text-amber-400 mb-6">🗂️ Daftar Kategori</h3>
                <div className="space-y-3">
                    {categories.map((cat, index) => (
                        <div 
                            key={cat._id} 
                            style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0, transition: 'all 0.3s ease' }}
                            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700 hover:border-amber-400 hover:shadow-lg hover:scale-[1.02]"
                        >
                            <span className="text-gray-200 font-semibold">{cat.name} {cat.isProtected && <span className="text-xs text-gray-500 font-normal ml-2">(🔒 Dilindungi)</span>}</span>
                            <div className="flex gap-4">
                                <button onClick={() => handleEditClick(cat)} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-transform transform hover:scale-110">Ubah</button>
                                {!cat.isProtected && <button onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition-transform transform hover:scale-110">Hapus</button>}
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="text-center py-10 bg-gray-800 rounded-lg">
                            <p className="text-gray-400">Belum ada kategori. Silakan tambahkan satu!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ManageCategories;
