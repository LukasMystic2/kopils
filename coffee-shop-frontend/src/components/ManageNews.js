import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ImageEditorModal = ({ file, onConfirm, onCancel }) => {
  const [width, setWidth] = useState(400);
  const [quality, setQuality] = useState(0.8);
  const [previewURL, setPreviewURL] = useState('');
  const imageContainerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setInitialMouseX(e.clientX);
    setInitialWidth(imageContainerRef.current.offsetWidth);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const dx = e.clientX - initialMouseX;
    const newWidth = Math.max(100, Math.min(initialWidth + dx, 400));
    setWidth(Math.round(newWidth));
  }, [isResizing, initialMouseX, initialWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewURL(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleApply = () => {
    const img = new Image();
    img.src = previewURL;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round(width / aspectRatio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          onConfirm(resizedFile);
        },
        file.type,
        quality
      );
    };
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '450px',
          maxWidth: '100%',
          color: 'white'
      }}>
        <h3 className="text-xl font-semibold mb-4 text-amber-400">🖼️ Ubah Ukuran & Kompres Gambar</h3>
        {previewURL && (
          <div ref={imageContainerRef} className="relative flex justify-center mb-4 bg-gray-900/50 p-2 rounded-lg" style={{ width: `${width}px`, margin: '0 auto 1rem auto' }}>
            <img src={previewURL} alt="Preview" className="max-h-48 object-contain w-full" />
            <div
              onMouseDown={handleMouseDown}
              className="absolute bottom-1 right-1 w-4 h-4 bg-amber-500 rounded-full cursor-se-resize border-2 border-gray-800 hover:bg-amber-400"
              title="Drag to resize"
            />
          </div>
        )}
        <div className="my-4">
          <label className="block text-sm mb-2 font-medium text-gray-300">Lebar (px): <span className="text-amber-400 font-bold">{width}</span></label>
          <input type="range" min="100" max="400" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-slider" />
        </div>
        <div className="my-4">
          <label className="block text-sm mb-2 font-medium text-gray-300">Kualitas (0.1–1): <span className="text-amber-400 font-bold">{quality}</span></label>
          <input type="range" step="0.1" min="0.1" max="1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-slider" />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">Batal</button>
          <button 
            onClick={handleApply} 
            className="px-4 py-2 text-white rounded-lg transition-all transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            Terapkan & Unggah
          </button>
        </div>
      </div>
    </div>
  );
};

const processImageWithModal = (file) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const cleanup = () => { root.unmount(); document.body.removeChild(container); };
    root.render(<ImageEditorModal file={file} onConfirm={(file) => { cleanup(); resolve(file); }} onCancel={() => { cleanup(); reject(new Error('Cancelled')); }} />);
  });
};

const ManageNews = ({ showNotification = () => {} }) => {
    const [news, setNews] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isTopNews, setIsTopNews] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [existingThumbnail, setExistingThumbnail] = useState('');
    const [editingArticle, setEditingArticle] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = `${process.env.SERVER_URL}`;

    const fetchNews = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/news?_=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Tidak dapat mengambil berita. Sesi Anda mungkin telah berakhir.');
            const data = await response.json();
            setNews(data);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [API_URL, showNotification]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    function CustomUploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new MyUploadAdapter(loader);
        };
    }

    class MyUploadAdapter {
        constructor(loader) { this.loader = loader; }
        async upload() {
            const originalFile = await this.loader.file;
            try {
                const endpoint = `${API_URL}/api/about/upload/editor`; 
                const processedFile = await processImageWithModal(originalFile);
                const formData = new FormData();
                formData.append("image", processedFile);
                const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
                const res = await fetch(endpoint, {
                    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
                });
                if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || "Gagal mengunggah."); }
                const data = await res.json();
                return { default: data.url };
            } catch (err) {
                if (!err.message.includes('Cancelled')) showNotification(err.message, "error");
                return Promise.reject(err);
            }
        }
        abort() {}
    }

    const resetForm = () => {
        setTitle('');
        setContent('');
        setIsTopNews(false);
        setThumbnailFile(null);
        setEditingArticle(null);
        setExistingThumbnail('');
        const fileInput = document.getElementById('news-thumbnail-input');
        if (fileInput) fileInput.value = '';
    };

    const handleTopNewsChange = (e) => {
        const checked = e.target.checked;
        if (checked) {
            const topNewsCount = news.filter(n => n.isTopNews && n._id !== editingArticle?._id).length;
            if (topNewsCount >= 3) {
                showNotification("Anda hanya dapat memiliki maksimal 3 berita utama.", "error");
                return;
            }
        }
        setIsTopNews(checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

        try {
            let uploadedThumbnailUrl = existingThumbnail;

            if (thumbnailFile) {
                const thumbnailFormData = new FormData();
                thumbnailFormData.append('thumbnail', thumbnailFile);

                const uploadRes = await fetch(`${API_URL}/api/news/upload/thumbnail`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: thumbnailFormData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Gagal mengunggah thumbnail.');
                }
                const uploadData = await uploadRes.json();
                uploadedThumbnailUrl = uploadData.url;
            }

            const articleData = {
                title,
                content,
                isTopNews,
                thumbnailUrl: uploadedThumbnailUrl,
            };

            const url = editingArticle ? `${API_URL}/api/news/${editingArticle._id}` : `${API_URL}/api/news`;
            const method = editingArticle ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan artikel berita');
            }

            showNotification(editingArticle ? 'Artikel berita diperbarui!' : 'Artikel berita dibuat!');
            resetForm();
            fetchNews();

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setTitle(article.title);
        setContent(article.content);
        setIsTopNews(article.isTopNews);
        setExistingThumbnail(article.thumbnailUrl || '');
        setThumbnailFile(null);
        window.scrollTo({ top: document.getElementById('manage-news-section').offsetTop, behavior: 'smooth' });
    };
    
    const handleRemoveThumbnail = () => {
        setExistingThumbnail('');
        setThumbnailFile(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus artikel berita ini? Ini juga akan menghapus thumbnail dan semua gambar kontennya.')) {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            try {
                const response = await fetch(`${API_URL}/api/news/${id}`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Gagal menghapus artikel berita');
                showNotification('Artikel berita berhasil dihapus!');
                fetchNews();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };
    
    // FIX: Decode HTML entities like &nbsp; for the preview text
    const cleanHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const { topNews, regularNews } = useMemo(() => {
        const top = news.filter(n => n.isTopNews);
        const regular = news.filter(n => !n.isTopNews);
        return { topNews: top, regularNews: regular };
    }, [news]);
    
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
        <div className="space-y-8" id="manage-news-section">
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
                <h3 className="text-xl font-bold text-amber-400 mb-6"> {editingArticle ? 'Edit Artikel Berita' : 'Tambah Artikel Berita'}</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#fbbf24'} onBlur={e => e.target.style.borderColor = 'transparent'} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Konten</label>
                        <div className="editor-container">
                            <CKEditor
                                editor={ClassicEditor}
                                data={content}
                                config={{
                                    extraPlugins: [CustomUploadAdapterPlugin],
                                    mediaEmbed: { previewsInData: true },
                                    image: { toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ] },
                                    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'alignment', '|', 'imageUpload', 'mediaEmbed', 'blockQuote', 'insertTable', '|', 'undo', 'redo' ]
                                }}
                                onChange={(event, editor) => setContent(editor.getData())}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail (untuk pratinjau kartu)</label>
                        <input type="file" id="news-thumbnail-input" onChange={(e) => setThumbnailFile(e.target.files[0])} accept="image/*" className={fileInputStyle} />
                        {editingArticle && existingThumbnail && !thumbnailFile && (
                            <div className="mt-4 flex items-center gap-4">
                                <img src={existingThumbnail} alt="Thumbnail saat ini" className="h-20 w-20 object-cover rounded-md border-2 border-gray-700"/>
                                <button type="button" onClick={handleRemoveThumbnail} className="text-sm bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 transition-all transform hover:scale-105">Hapus Thumbnail</button>
                            </div>
                        )}
                         {thumbnailFile && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-400">Pratinjau thumbnail baru:</p>
                                <img src={URL.createObjectURL(thumbnailFile)} alt="Pratinjau thumbnail baru" className="h-20 w-20 object-cover rounded-md mt-1 border-2 border-gray-700"/>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="isTopNews" checked={isTopNews} onChange={handleTopNewsChange} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-amber-600 focus:ring-amber-500" />
                        <label htmlFor="isTopNews" className="text-sm text-gray-300">Tandai sebagai Berita Utama</label>
                    </div>
                </div>
                <div className="flex gap-4 mt-6">
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="flex-grow text-white p-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                        }}
                    >
                        {isSubmitting ? 'Menyimpan...' : (editingArticle ? 'Perbarui Artikel' : 'Tambah Artikel')}
                    </button>
                    {editingArticle && <button type="button" onClick={resetForm} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-500 transition-colors">Batal Edit</button>}
                </div>
            </form>
            
            {topNews.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-amber-400 mb-4">⭐ Berita Utama ({topNews.length}/3)</h3>
                    <div className="space-y-4">
                        {topNews.map(article => (
                            <div key={article._id} className="bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4 border border-gray-700/50">
                                <div className="flex items-start sm:items-center gap-4 w-full">
                                    <img src={article.thumbnailUrl || 'https://placehold.co/100x100/1f2937/4b5563?text=No+Img'} alt={article.title} className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg text-amber-400">{article.title}</h4>
                                        <p className="text-gray-400 text-sm">{cleanHtml(article.content).substring(0, 100)}...</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                    <button onClick={() => handleEdit(article)} className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-500 text-sm transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(article._id)} className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 text-sm transition-colors">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12">
                <h3 className="text-xl font-bold text-amber-400 mb-4">Semua Berita Lainnya</h3>
                <div className="space-y-4">
                    {regularNews.map(article => (
                        <div key={article._id} className="bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4 border border-gray-700/50">
                           <div className="flex items-start sm:items-center gap-4 w-full">
                                <img src={article.thumbnailUrl || 'https://placehold.co/100x100/1f2937/4b5563?text=No+Img'} alt={article.title} className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <h4 className="font-bold text-lg text-amber-400">{article.title}</h4>
                                    <p className="text-gray-400 text-sm">{cleanHtml(article.content).substring(0, 100)}...</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                <button onClick={() => handleEdit(article)} className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-500 text-sm transition-colors">Edit</button>
                                <button onClick={() => handleDelete(article._id)} className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 text-sm transition-colors">Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <style>{`
                .editor-container .ck-editor__editable_inline {
                    min-height: 400px;
                    color: #1f2937;
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #fbbf24;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 2px solid #111827;
                }
                .range-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: #fbbf24;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 2px solid #111827;
                }
            `}</style>
        </div>
    );
};

export default ManageNews;
