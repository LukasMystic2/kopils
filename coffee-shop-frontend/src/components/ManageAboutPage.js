import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// --- Standalone Image Editor Modal Component ---
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

const ManageAboutPage = ({ showNotification = () => {} }) => {
  const [content, setContent] = useState('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const API_URL = process.env.SERVER_URL;

  const fetchAboutContent = useCallback(async () => {
    setIsLoadingContent(true);
    try {
      const response = await fetch(`${API_URL}/api/about?_=${new Date().getTime()}`);
      if (!response.ok) throw new Error('Could not fetch about page content.');
      const data = await response.json();
      setContent(data.content || '');
      setLastUpdatedBy(data.lastUpdatedBy);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoadingContent(false);
    }
  }, [API_URL, showNotification]);

  useEffect(() => { fetchAboutContent(); }, [fetchAboutContent]);

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
        const processedFile = await processImageWithModal(originalFile);
        const formData = new FormData();
        formData.append("image", processedFile);
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/api/about/upload/editor`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
        });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || "Upload failed."); }
        const data = await res.json();
        return { default: data.url };
      } catch (err) {
        if (!err.message.includes('Cancelled')) showNotification(err.message, "error");
        return Promise.reject(err);
      }
    }
    abort() {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/about`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Failed to save about page');
      showNotification('About page updated successfully!');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingContent) {
    return <div className="flex items-center justify-center h-48 text-lg text-gray-400">Memuat konten...</div>;
  }

  return (
    <div className="space-y-8">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-xl font-bold text-amber-400">✍️ Kelola Halaman Tentang Kami</h3>
          {lastUpdatedBy && <p className="text-sm text-gray-400 mt-2 sm:mt-0">Terakhir diperbarui oleh: {lastUpdatedBy}</p>}
        </div>
        
        <div className="editor-container">
          <CKEditor
            editor={ClassicEditor}
            data={content}
            config={{
              extraPlugins: [CustomUploadAdapterPlugin],
              mediaEmbed: { previewsInData: true },
              image: { toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ] }
            }}
            onChange={(event, editor) => setContent(editor.getData())}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full text-white p-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
            }}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Halaman'}
          </button>
        </div>
      </form>
      <style>{`
        .editor-container .ck-editor__editable_inline {
            min-height: 400px;
            color: #1f2937; /* Tailwind gray-800 for better readability */
        }
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #fbbf24; /* amber-400 */
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid #111827; /* gray-900 */
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

export default ManageAboutPage;
