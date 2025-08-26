import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FullPageTranslator = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState('original');
  const [originalContent, setOriginalContent] = useState(new Map());
  const [translatedContent, setTranslatedContent] = useState(new Map());
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  setOriginalContent(prevContent => {
    if (prevContent.size > 0) {
      prevContent.forEach(item => {
        if (item.node && item.node.parentElement) {
          item.node.textContent = item.text;
        }
      });
    }
    return new Map(); // reset
  });

  setTranslatedContent(new Map());
  setCurrentLang('original');
  setIsOpen(false);
}, [location.pathname]);



  const languages = [
    { code: 'original', name: 'Original', flag: '🌍' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  const getTextNodes = (element = document.body) => {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent || parent.closest('.translator-widget')) {
            return NodeFilter.FILTER_REJECT;
          }
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    return textNodes;
  };

  const translateTextAPI = async (texts, targetLang) => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const prompt = `Translate the following JSON array of strings into ${languages.find(l => l.code === targetLang)?.name}. Return a JSON array of the translated strings in the exact same order. Maintain the original capitalization and punctuation. Only output the JSON array.

      Input:
      ${JSON.stringify(texts)}
      
      Output:
      `;

      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
              }),
          });

          if (!response.ok) {
              console.error("API Error Response:", await response.text());
              return texts;
          }

          const result = await response.json();
          const translatedTextRaw = result.candidates?.[0]?.content?.parts?.[0]?.text;

          if (translatedTextRaw) {
              const jsonString = translatedTextRaw.replace(/```json|```/g, '').trim();
              const translatedArray = JSON.parse(jsonString);
              return Array.isArray(translatedArray) && translatedArray.length === texts.length ? translatedArray : texts;
          }
          return texts;
      } catch (error) {
          console.error('Failed to translate text:', error);
          return texts;
      }
  };

  const storeOriginalContent = () => {
    if (originalContent.size === 0) {
      const nodes = getTextNodes();
      const content = new Map();
      nodes.forEach((node, index) => {
        content.set(index, { node, text: node.textContent });
      });
      setOriginalContent(content);
      return content;
    }
    return originalContent;
  };

  const translatePage = async (targetLang) => {
    if (targetLang === 'original') {
      restoreOriginalContent();
      return;
    }

    setIsTranslating(true);
    setProgress(0);
    setIsOpen(false);

    const content = storeOriginalContent();
    const cacheKey = targetLang;

    if (translatedContent.has(cacheKey)) {
        const cachedTranslations = translatedContent.get(cacheKey);
        content.forEach((item, index) => {
            if (item.node) item.node.textContent = cachedTranslations.get(index) || item.text;
        });
        setCurrentLang(targetLang);
        setIsTranslating(false);
        return;
    }

    const newTranslations = new Map();
    const entries = Array.from(content.entries());
    const batchSize = 50;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const textsToTranslate = batch.map(([, item]) => item.text);
      const translatedTexts = await translateTextAPI(textsToTranslate, targetLang);

      batch.forEach(([index, item], batchIndex) => {
        const translatedText = translatedTexts[batchIndex];
        if (item.node) item.node.textContent = translatedText;
        newTranslations.set(index, translatedText);
      });

      setProgress(((i + batchSize) / entries.length) * 100);
    }

    setTranslatedContent(prev => new Map(prev.set(cacheKey, newTranslations)));
    setCurrentLang(targetLang);
    setIsTranslating(false);
    setProgress(0);
  };

  const restoreOriginalContent = () => {
    originalContent.forEach(item => {
      if (item.node) item.node.textContent = item.text;
    });
    setCurrentLang('original');
    setIsOpen(false);
  };

  return (
    <div className="translator-widget">
      {isTranslating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '280px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', border: '3px solid #dbeafe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h3 style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>Translating...</h3>
            <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '0.5rem', overflow: 'hidden' }}>
              <div style={{ background: '#3b82f6', height: '100%', borderRadius: '9999px', transition: 'width 0.3s ease', width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ transition: 'all 0.5s ease-out', opacity: !isOpen && mounted ? 1 : 0, transform: !isOpen && mounted ? 'translateY(0)' : 'translateY(10px)' }}>

        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isTranslating}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transform hover:scale-110 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', boxShadow: '0 4px 20px rgba(96, 165, 250, 0.4)' }}
          >
            <i className={`fas fa-language text-2xl text-white transition-transform duration-300 ${isOpen ? 'rotate-[360deg]' : ''}`}></i>
          </button>
        </div>
      </div>

      <div style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '1.25rem',
          width: 'calc(100% - 2.5rem)',
          maxWidth: '320px',
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          border: '1px solid rgba(75, 85, 99, 0.4)',
          transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          zIndex: 10,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          color: 'white',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column'
      }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(75, 85, 99, 0.5)', flexShrink: 0 }}>
              <h3 style={{ fontWeight: 600 }}>Translate Page</h3>
          </div>
          <div style={{ overflowY: 'auto', padding: '1rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {languages.map(lang => (
                      <button
                          key={lang.code}
                          onClick={() => lang.code === 'original' ? restoreOriginalContent() : translatePage(lang.code)}
                          disabled={currentLang === lang.code}
                          style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              background: currentLang === lang.code ? 'rgba(96, 165, 250, 0.2)' : 'rgba(75, 85, 99, 0.5)',
                              border: '1px solid',
                              borderColor: currentLang === lang.code ? 'rgba(96, 165, 250, 0.5)' : 'transparent',
                              textAlign: 'left',
                              width: '100%',
                              cursor: currentLang === lang.code ? 'default' : 'pointer',
                              transition: 'background 0.2s'
                          }}
                          onMouseOver={e => { if (currentLang !== lang.code) e.currentTarget.style.background = 'rgba(107, 114, 128, 0.5)' }}
                          onMouseOut={e => { if (currentLang !== lang.code) e.currentTarget.style.background = 'rgba(75, 85, 99, 0.5)' }}
                      >
                          <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
                          <span style={{ flexGrow: 1, fontWeight: 500 }}>{lang.name}</span>
                          {currentLang === lang.code && <i className="fas fa-check text-blue-400"></i>}
                      </button>
                  ))}
              </div>
          </div>
      </div>
       <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
  );
};

export default FullPageTranslator;
