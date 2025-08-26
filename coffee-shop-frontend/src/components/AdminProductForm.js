// components/ManageProducts.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ProductCard from './ProductCard'; 

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
`;

const ManageProducts = ({ showNotification = () => {} }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount: '',
        stock: '',
        category: '',
        imageUrl: '',
        weight: '',
        isFeatured: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State untuk menangani efek hover pada tombol secara inline
    const [submitHover, setSubmitHover] = useState(false);
    const [cancelHover, setCancelHover] = useState(false);

    const API_URL = `${process.env.SERVER_URL}`;

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/products?_=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Gagal memuat produk.');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [showNotification, API_URL]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories?_=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Gagal memuat kategori.');
            const data = await response.json();
            setCategories(data);
            if (!formData.category && data.length > 0) {
                setFormData(prev => ({ ...prev, category: data[0]._id }));
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [showNotification, formData.category, API_URL]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'isFeatured' && checked) {
            const featuredCount = products.filter(p => p.isFeatured && p._id !== editingProduct?._id).length;
            if (featuredCount >= 3) {
                showNotification("Anda hanya bisa menandai maksimal 3 produk unggulan.", "error");
                return;
            }
        }

        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleDescriptionChange = (event, editor) => {
        const data = editor.getData();
        setFormData(prev => ({ ...prev, description: data }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discount: '',
            stock: '',
            category: categories.length > 0 ? categories[0]._id : '',
            imageUrl: '',
            weight: '',
            isFeatured: false
        });
        setImageFile(null);
        setEditingProduct(null);
        const fileInput = document.getElementById('product-image-input');
        if(fileInput) fileInput.value = '';
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            discount: product.discount || 0,
            stock: product.stock,
            category: product.category?._id || (categories.length > 0 ? categories[0]._id : ''),
            imageUrl: product.imageUrl || '',
            weight: product.weight || '',
            isFeatured: product.isFeatured || false
        });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const productFormData = new FormData();
        // Append all form data
        Object.keys(formData).forEach(key => {
            productFormData.append(key, formData[key]);
        });
        if (imageFile) {
            productFormData.append('image', imageFile);
        }

        try {
            const url = editingProduct ? `${API_URL}/api/products/${editingProduct._id}` : `${API_URL}/api/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: productFormData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan produk');
            }

            showNotification(editingProduct ? 'Produk berhasil diperbarui!' : 'Produk berhasil dibuat!');
            resetForm();
            fetchProducts();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (productId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            try {
                const response = await fetch(`${API_URL}/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Gagal menghapus produk');
                showNotification('Produk berhasil dihapus!');
                fetchProducts();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const { featuredProducts, otherProducts } = useMemo(() => {
        const featured = products.filter(p => p.isFeatured);
        const others = products.filter(p => !p.isFeatured);
        return { featuredProducts: featured, otherProducts: others };
    }, [products]);

    // --- Objek Gaya Inline untuk UI yang lebih dinamis ---
    const formSectionStyle = {
        transition: 'all 0.5s ease-in-out',
        borderLeft: '4px solid #FBBF24', // amber-400
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        transform: editingProduct ? 'scale(1.02)' : 'scale(1)',
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
             {/* Menambahkan tag <style> untuk keyframes animasi */}
            <style>{animationStyle}</style>

            <section className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700" style={formSectionStyle}>
                <h2 className="text-2xl font-bold text-amber-400 mb-6" style={{ letterSpacing: '1px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {editingProduct ? '📝 Ubah Produk' : '✨ Tambah Produk Baru'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nama Produk" style={inputStyle} className="p-3 border rounded w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required />
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Harga (IDR)" style={inputStyle} className="p-3 border rounded w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required min="0"/>
                        <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} placeholder="Diskon (%)" style={inputStyle} className="p-3 border rounded w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" min="0" max="100" />
                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Jumlah Stok" style={inputStyle} className="p-3 border rounded w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required min="0" />
                        <select name="category" value={formData.category} onChange={handleInputChange} style={inputStyle} className="p-3 border rounded w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                        <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="Berat (cth: 200g)" style={inputStyle} className="p-3 border rounded w-full bg-gray-900 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi Produk 📜</label>
                        <div className="rounded-lg overflow-hidden border border-gray-600">
                            <CKEditor editor={ClassicEditor} data={formData.description} onChange={handleDescriptionChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Gambar Produk 🖼️</label>
                        <input type="file" id="product-image-input" name="image" onChange={handleFileChange} accept="image/*" className="mt-2 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-amber-400 hover:file:bg-gray-600 cursor-pointer"/>
                        <div className="mt-4 h-24 w-24 rounded-lg bg-gray-700 flex items-center justify-center" style={{ transition: 'all 0.3s ease' }}>
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover rounded-lg"/>
                            ) : editingProduct && formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Current" className="h-full w-full object-cover rounded-lg"/>
                            ) : (
                                <span className="text-xs text-gray-400">Pratinjau Gambar</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-lg">
                        <input type="checkbox" name="isFeatured" id="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="h-5 w-5 rounded border-gray-400 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <label htmlFor="isFeatured" className="text-sm text-gray-200 font-semibold cursor-pointer">Jadikan Produk Unggulan ⭐</label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            style={{ ...buttonBaseStyle, ...(submitHover ? buttonHoverStyle : {}) }}
                            onMouseEnter={() => setSubmitHover(true)}
                            onMouseLeave={() => setSubmitHover(false)}
                            className="flex-grow bg-amber-600 text-white font-bold p-3 rounded-lg hover:bg-amber-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Menyimpan...' : (editingProduct ? 'Perbarui Produk' : '🚀 Tambah Produk')}
                        </button>
                        {editingProduct && (
                            <button 
                                type="button" 
                                onClick={resetForm} 
                                style={{ ...buttonBaseStyle, ...(cancelHover ? buttonHoverStyle : {}) }}
                                onMouseEnter={() => setCancelHover(true)}
                                onMouseLeave={() => setCancelHover(false)}
                                className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-500">
                                Batal Edit
                            </button>
                        )}
                    </div>
                </form>
            </section>
            
            {featuredProducts.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-amber-400 mb-6">🌟 Produk Unggulan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredProducts.map((product, index) => (
                             <div key={product._id} style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}>
                                <ProductCard product={product} onDelete={handleDelete} onEdit={handleEdit} view="admin"/>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-2xl font-bold text-amber-400 mb-6">📦 Semua Produk Lainnya</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {otherProducts.map((product, index) => (
                        <div key={product._id} style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}>
                            <ProductCard product={product} onDelete={handleDelete} onEdit={handleEdit} view="admin"/>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ManageProducts;