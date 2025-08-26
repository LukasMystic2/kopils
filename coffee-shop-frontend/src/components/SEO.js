import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, imageUrl, structuredData }) => {
  // --- Nilai SEO Default dalam Bahasa Indonesia ---
  const defaultTitle = "Kopi LS - Cita Rasa Kopi Alami dari Dampit";
  const defaultDescription = "Temukan Kopi LS, kopi Robusta autentik yang didatangkan langsung dari Dampit. Rasakan proses alami dan cita rasa sejati budaya kopi Indonesia.";
  const siteUrl = "https://www.kopils.com"; // Domain situs Anda
  const defaultImage = `${siteUrl}/assets/Logo_bubuk.png`; // Gambar default untuk media sosial

  // --- Nilai SEO Final (properti akan menimpa default) ---
  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    url: `${siteUrl}${url || ''}`, // Mengasumsikan prop 'url' adalah path seperti "/" atau "/tentang"
    image: imageUrl || defaultImage,
  };

  return (
    <Helmet>
      {/* --- Tag Meta Utama --- */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <html lang="id" /> {/* Memberi tahu Google bahwa halaman ini dalam Bahasa Indonesia */}

      {/* --- Open Graph / Facebook --- */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:locale" content="id_ID" /> {/* Menentukan lokal Bahasa Indonesia */}


      {/* --- Twitter --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* --- Tag Lainnya --- */}
      <link rel="canonical" href={seo.url} />

      {/* Merender data terstruktur jika disediakan */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
