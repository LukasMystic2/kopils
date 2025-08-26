import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO'; // <-- IMPOR KOMPONEN SEO BARU ANDA
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import Location from '../components/Location';
import useFetch from '../hooks/useFetch';

// Custom hook for observing elements for scroll animations
const useIntersectionObserver = (options) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(new IntersectionObserver(([entry]) => setEntry(entry), options));

  useEffect(() => {
    const { current: currentObserver } = observer;
    currentObserver.disconnect();
    if (node) currentObserver.observe(node);
    return () => currentObserver.disconnect();
  }, [node]);

  return [setNode, entry];
};

// Default content to display while data is loading or if fetching fails
const defaultContent = {
    hero: { details: [
        { title: "Kopi LS", tagline: "Cita Rasa Kopi Alami", imageUrl: "https://www.treatt.com/media/pages/news/the-journey-of-the-coffee-bean/3bd4677a46-1746605375/shutterstock-1707181633-1-1440x720-crop-q70.jpg" },
        { title: "Pure Robusta", tagline: "Directly from the Heart of Dampit", imageUrl: "https://www.nescafe.com/gb/sites/default/files/2023-11/Untitled-5%20copy_6.jpg" },
        { title: "Naturally Processed", tagline: "Authentic Flavor in Every Sip", imageUrl: "https://5.imimg.com/data5/SELLER/Default/2021/8/AP/WL/GJ/5504430/roasted-coffee-beans.jpg" }
    ]},
    description: { title: 'Robusta Asli, Dibuat Secara Alami', text: "Di Kopi LS, kami percaya pada kopi yang bercerita. Diambil langsung dari perkebunan subur di Dampit, biji Robusta kami adalah bukti kesempurnaan alam. Kami berdedikasi untuk menjaga cita rasa asli yang kuat melalui proses alami, menghadirkan pengalaman kopi yang tak terlupakan dari keluarga kami untuk Anda.", imageUrl: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?q=80&w=2938&auto-format=fit=crop' },
    whyUs: { details: [{title: 'Asal Tunggal', description: 'Semua biji kopi kami berasal dari daerah kopi terkenal di Dampit, memastikan kualitas dan rasa yang konsisten.'}, {title: 'Proses Alami', description: 'Kami menggunakan metode pengolahan tradisional dan alami yang meningkatkan cita rasa asli kopi tanpa bahan tambahan.'}, {title: 'Fokus Komunitas', description: 'Kami bekerja sama langsung dengan petani lokal, mendukung komunitas dan memastikan praktik yang adil.'}], imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2938&auto-format=fit=crop' },
    quote: { text: "Secangkir Kopi LS bukan hanya minuman; ini adalah perjalanan ke jantung budaya kopi Indonesia.", cite: "- Pelanggan Setia", imageUrl: 'https://images.unsplash.com/photo-1525095362582-53733b661365?q=80&w=2835&auto=format&fit=crop' },
};

const placeholderNews = [
  { _id: 'ph1', slug: '#', title: 'Selamat Datang di Kopi LS!', content: 'Nantikan berita dan pembaruan menarik tentang kopi kami.', createdAt: new Date().toISOString(), thumbnailUrl: 'https://placehold.co/600x400/111827/4b5563?text=Berita' },
  { _id: 'ph2', slug: '#', title: 'Cerita Kami', content: 'Pelajari lebih lanjut tentang semangat kami terhadap kopi Robusta asli di halaman Tentang Kami.', createdAt: new Date().toISOString(), thumbnailUrl: 'https://placehold.co/600x400/111827/4b5563?text=Berita' },
  { _id: 'ph3', slug: '#', title: 'Kunjungi Kami', content: 'Mampirlah ke toko kami di Dampit untuk merasakan cita rasa sejati kopi alami.', createdAt: new Date().toISOString(), thumbnailUrl: 'https://placehold.co/600x400/111827/4b5563?text=Berita' },
];

const placeholderProduct = {
    _id: 'ph-prod', name: 'Segera Hadir', description: 'Produk baru dan menarik sedang dalam perjalanan. Periksa kembali segera untuk detail lebih lanjut!', price: 0, stock: 0, imageUrl: 'https://placehold.co/600x400/111827/4b5563?text=Segera+Hadir'
};


const HomePage = ({ onUpdate }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topNews, setTopNews] = useState([]);
  const [siteContent, setSiteContent] = useState(defaultContent);
  const [isVisible, setIsVisible] = useState({});
  const API_URL = `${process.env.SERVER_URL}`;

  const { data: productsData, loading: productsLoading } = useFetch(`${API_URL}/api/products`);
  const { data: contentData } = useFetch(`${API_URL}/api/content`);
  const { data: newsData } = useFetch(`${API_URL}/api/news`);

  const [descRef, descEntry] = useIntersectionObserver({ threshold: 0.2 });
  const [productsRef, productsEntry] = useIntersectionObserver({ threshold: 0.1 });
  const [newsRef, newsEntry] = useIntersectionObserver({ threshold: 0.1 });
  const [whyRef, whyEntry] = useIntersectionObserver({ threshold: 0.1 });
  const [quoteRef, quoteEntry] = useIntersectionObserver({ threshold: 0.1 });
  const [statsRef, statsEntry] = useIntersectionObserver({ threshold: 0.3 });

  const whyUsIcons = ["fas fa-leaf", "fas fa-cogs", "fas fa-users"];

  useEffect(() => {
    if (productsData && contentData && newsData) {
        let featured = productsData.filter(p => p.isFeatured);
        while (featured.length < 3) {
            featured.push({...placeholderProduct, _id: `ph-prod-${featured.length}`});
        }
        setFeaturedProducts(featured.slice(0, 3));

        let top = newsData.filter(n => n.isTopNews);
        if (top.length === 0) {
            top = newsData.slice(0,3);
        }
        while (top.length < 3) {
            if (top.length < placeholderNews.length) {
                top.push(placeholderNews[top.length]);
            } else {
                break;
            }
        }
        setTopNews(top.slice(0, 3));
        
        const finalContent = {
            hero: (!contentData.hero || !contentData.hero.details) ? defaultContent.hero : contentData.hero,
            description: (!contentData.description || !contentData.description.text) ? defaultContent.description : contentData.description,
            whyUs: (!contentData.whyUs || !contentData.whyUs.details) ? defaultContent.whyUs : contentData.whyUs,
            quote: (!contentData.quote || !contentData.quote.text) ? defaultContent.quote : contentData.quote,
        };
        setSiteContent(finalContent);
    }
  }, [productsData, contentData, newsData]);

  // Track visibility for animations
  useEffect(() => {
    const sections = ['desc', 'products', 'news', 'why', 'quote', 'stats'];
    const entries = [descEntry, productsEntry, newsEntry, whyEntry, quoteEntry, statsEntry];
    
    entries.forEach((entry, index) => {
      if (entry?.isIntersecting) {
        setIsVisible(prev => ({ ...prev, [sections[index]]: true }));
      }
    });
  }, [descEntry, productsEntry, newsEntry, whyEntry, quoteEntry, statsEntry]);

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return "Tanggal tidak tersedia";
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const sanitizeContent = (content) => {
    if (!content) return "";
    return content.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
  };

  // --- Menyiapkan Data untuk Komponen SEO ---
  const pageTitle = "Kopi LS - Cita Rasa Kopi Alami dari Dampit";
  const pageDescription = "Temukan Kopi LS, kopi Robusta autentik yang didatangkan langsung dari Dampit. Rasakan proses alami dan cita rasa sejati budaya kopi Indonesia.";
  const siteUrl = "https://www.kopils.com";
  const logoUrl = `${siteUrl}/assets/Logo_bubuk.png`;

  // Data Terstruktur untuk bisnis lokal Anda
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CoffeeStore",
    "name": "Kopi LS",
    "description": pageDescription,
    "url": siteUrl,
    "image": siteContent.description?.imageUrl || defaultContent.description.imageUrl,
    "logo": logoUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Ahmad Yani Gang Satria Lama Nomor 11", // Contoh alamat
      "addressLocality": "Blimbing",
      "addressRegion": "Malang",
      "postalCode": "65125", // Contoh kode pos
      "addressCountry": "ID"
    },
    "telephone": "+6289654637971" // Contoh nomor telepon
  };


  return (
    <div className="bg-gray-950 text-gray-200 min-h-screen">
      
      {/* --- GUNAKAN KOMPONEN SEO DI SINI --- */}
      <SEO
        title={pageTitle}
        description={pageDescription}
        url="/" // Path untuk halaman beranda
        imageUrl={siteContent.hero.details[0]?.imageUrl || defaultContent.hero.details[0].imageUrl}
        structuredData={structuredData}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        .font-heading { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-accent { font-family: 'Space Grotesk', sans-serif; }
        
        .fade-in-section { 
          opacity: 0; 
          transform: translateY(50px); 
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .fade-in-section.is-visible { 
          opacity: 1; 
          transform: translateY(0); 
        }
        
        .parallax { 
          background-attachment: fixed; 
          background-position: center; 
          background-repeat: no-repeat; 
          background-size: cover; 
        }
        
        .glass-morphism {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #f59e0b, #d97706, #92400e);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
          transform: translateY(-5px);
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        .bg-noise {
          background-image: 
            radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.02) 2%, transparent 2%),
            radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.02) 2%, transparent 2%);
          background-size: 100px 100px;
        }
        
        .text-shadow {
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent);
        }
      `}</style>

      {/* Enhanced Hero Section */}
      <div className="relative">
        <HeroSection slides={siteContent.hero.details} />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <i className="fas fa-coffee text-6xl text-amber-500"></i>
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-10" style={{ animationDelay: '1s' }}>
          <i className="fas fa-seedling text-8xl text-green-500"></i>
        </div>
      </div>

      {/* Stats Section */}
      <section ref={statsRef} className={`py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-gray-700/50 ${isVisible.stats ? 'fade-in-section is-visible' : 'fade-in-section'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold gradient-text font-accent">5+</div>
              <div className="text-gray-400 font-medium mt-2 group-hover:text-amber-400 transition-colors">Tahun Pengalaman</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold gradient-text font-accent">1000+</div>
              <div className="text-gray-400 font-medium mt-2 group-hover:text-amber-400 transition-colors">Pelanggan Bahagia</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold gradient-text font-accent">100%</div>
              <div className="text-gray-400 font-medium mt-2 group-hover:text-amber-400 transition-colors">Proses Alami</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold gradient-text font-accent">1</div>
              <div className="text-gray-400 font-medium mt-2 group-hover:text-amber-400 transition-colors">Asal: Dampit</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-noise">
        
        {/* Enhanced Description Section */}
        <section ref={descRef} className={`my-32 relative ${isVisible.desc ? 'fade-in-section is-visible' : 'fade-in-section'}`}>
          <div className="parallax relative rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundImage: `url(${siteContent.description?.imageUrl})`, minHeight: '600px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
            
            <div className="relative z-10 h-full flex items-center px-8 md:px-16 py-20">
              <div className="max-w-4xl">
                <div className="inline-block px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 mb-6 backdrop-blur-sm">
                  <span className="text-amber-300 font-accent font-medium text-sm">Cerita Kami</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-8 text-shadow leading-tight">
                  {siteContent.description?.title}
                </h2>
                
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 font-body">
                  {siteContent.description?.text}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link to="/about" className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-accent font-semibold rounded-full hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/30 transform hover:scale-105">
                    Pelajari Lebih Lanjut
                  </Link>
                  <Link to="/products" className="px-8 py-4 bg-white/10 text-white font-accent font-semibold rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    Lihat Produk Kami
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 opacity-20 animate-pulse-slow">
              <i className="fas fa-quote-right text-6xl text-amber-400"></i>
            </div>
          </div>
        </section>

        <div className="section-divider mb-32"></div>

        {/* Enhanced Featured Products Section */}
        <section ref={productsRef} className={`my-32 ${isVisible.products ? 'fade-in-section is-visible' : 'fade-in-section'}`}>
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700 mb-6 backdrop-blur-sm">
              <span className="text-amber-400 font-accent font-medium text-sm">Koleksi Premium</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 text-shadow">
              Produk <span className="gradient-text">Unggulan</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-body">
              Temukan pilihan biji kopi premium kami yang dikurasi khusus, langsung dari perkebunan terbaik di Dampit.
            </p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <div key={product._id} className="transform hover:scale-105 transition-all duration-300 hover-glow" style={{ animationDelay: `${index * 200}ms` }}>
                  <ProductCard product={product} view="guest" />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/products" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-accent font-semibold rounded-full hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/30 transform hover:scale-105">
              <span>Lihat Semua Produk</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </section>

        <div className="section-divider mb-32"></div>
        
        {/* Enhanced Why Us Section */}
        <section ref={whyRef} className={`my-32 relative ${isVisible.why ? 'fade-in-section is-visible' : 'fade-in-section'}`}>
          <div className="parallax relative rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundImage: `url(${siteContent.whyUs?.imageUrl})`, minHeight: '700px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-black/65"></div>
            
            <div className="relative z-10 py-20 px-8">
              <div className="text-center mb-16">
                <div className="inline-block px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 mb-6 backdrop-blur-sm">
                  <span className="text-amber-300 font-accent font-medium text-sm">Mengapa Memilih Kami</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 text-shadow">
                  Mengapa <span className="gradient-text">Kopi LS</span>?
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto font-body">
                  Kami bukan hanya merek kopi biasa. Kami adalah mitra Anda dalam menemukan cita rasa otentik budaya kopi Indonesia.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {siteContent.whyUs?.details?.map((item, index) => (
                  <div key={index} className="group text-center glass-morphism p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all duration-300 border border-amber-500/20">
                        <i className={`${whyUsIcons[index]} text-4xl text-amber-400 group-hover:scale-110 transition-transform duration-300`}></i>
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-2xl mb-4 text-white group-hover:text-amber-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 font-body leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider mb-32"></div>

        {/* Enhanced News Section */}
        <section ref={newsRef} className={`my-32 ${isVisible.news ? 'fade-in-section is-visible' : 'fade-in-section'}`}>
          <div className="glass-morphism py-20 px-8 rounded-3xl shadow-2xl border border-gray-700/50">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700 mb-6 backdrop-blur-sm">
                <span className="text-amber-400 font-accent font-medium text-sm">Berita Kopi</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 text-shadow">
                Berita <span className="gradient-text">Terbaru</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-body">
                Tetap terhubung dengan perkembangan terbaru dalam perjalanan kopi dan inisiatif komunitas kami.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {topNews.map((news, index) => (
                <Link 
                  to={`/news/${news.slug}`} 
                  key={news._id} 
                  className="block group transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 hover:border-amber-500/50">
                    <div className="relative overflow-hidden">
                      <img 
                        src={news.thumbnailUrl || 'https://placehold.co/600x400/111827/4b5563?text=Berita'} 
                        alt={news.title} 
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="fas fa-calendar text-amber-400 text-xs"></i>
                        <span className="text-sm text-gray-400 font-accent">{formatDate(news.createdAt)}</span>
                      </div>
                      <h3 className="font-heading font-bold text-xl mb-3 text-white group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 font-body line-clamp-3">
                        {sanitizeContent(news.content).substring(0, 120)}...
                      </p>
                      <div className="flex items-center gap-2 text-amber-500 group-hover:text-amber-400 transition-colors duration-300 font-accent font-semibold">
                        <span>Baca Selengkapnya</span>
                        <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-300"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/news" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-accent font-semibold rounded-full hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/30 transform hover:scale-105">
                <span>Lihat Semua Berita</span>
                <i className="fas fa-newspaper"></i>
              </Link>
            </div>
          </div>
        </section>

        <div className="section-divider mb-32"></div>

        {/* Enhanced Quote Section */}
        <section ref={quoteRef} className={`my-32 relative ${isVisible.quote ? 'fade-in-section is-visible' : 'fade-in-section'}`}>
          <div className="parallax relative rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundImage: `url(${siteContent.quote?.imageUrl})`, minHeight: '500px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent"></div>
            
            <div className="relative z-10 flex items-center justify-center h-full px-8 py-20">
              <div className="max-w-4xl text-center">
                <div className="mb-8">
                  <i className="fas fa-quote-left text-6xl text-amber-500/60 animate-pulse-slow"></i>
                </div>
                <blockquote className="text-3xl md:text-5xl italic font-light leading-relaxed font-heading text-white text-shadow mb-8">
                  {siteContent.quote?.text}
                </blockquote>
                <cite className="block text-xl font-semibold gradient-text font-accent">
                  {siteContent.quote?.cite}
                </cite>
                
                {/* Decorative stars */}
                <div className="flex justify-center gap-2 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-amber-400 animate-pulse-slow" style={{ animationDelay: `${i * 200}ms` }}></i>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider mb-16"></div>

        {/* Location Component */}
        <div className="my-32">
          <Location />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
