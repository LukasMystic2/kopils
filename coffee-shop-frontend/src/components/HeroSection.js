import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Placeholder slides to be used if the data from the backend is not available
const defaultSlides = [
    { title: "Kopi LS", tagline: "Cita Rasa Kopi Alami", imageUrl: "https://www.treatt.com/media/pages/news/the-journey-of-the-coffee-bean/3bd4677a46-1746605375/shutterstock-1707181633-1-1440x720-crop-q70.jpg" },
    { title: "Pure Robusta", tagline: "Directly from the Heart of Dampit", imageUrl: "https://www.nescafe.com/gb/sites/default/files/2023-11/Untitled-5%20copy_6.jpg" },
    { title: "Naturally Processed", tagline: "Authentic Flavor in Every Sip", imageUrl: "https://5.imimg.com/data5/SELLER/Default/2021/8/AP/WL/GJ/5504430/roasted-coffee-beans.jpg" }
];

const HeroSection = ({ slides }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
        cssEase: 'linear',
        arrows: false,
        pauseOnHover: false, // This ensures the carousel does not stop on mouse hover
    };

    // Use the slides from props if they exist and have content, otherwise use the default placeholders
    const finalSlides = slides && slides.length > 0 && slides.every(s => s.imageUrl) ? slides : defaultSlides;

    return (
        <div className="relative h-[70vh] w-full overflow-hidden">
             <style>{`
                .slick-dots li button:before {
                    font-size: 12px;
                    color: white;
                    opacity: 0.5;
                }
                .slick-dots li.slick-active button:before {
                    opacity: 1;
                    color: #f59e0b; /* amber-500 */
                }
                .font-heading { font-family: 'Playfair Display', serif; }
                .font-body { font-family: 'Roboto', sans-serif; }
            `}</style>
            <Slider {...settings}>
                {finalSlides.map((slide, index) => (
                    <div key={index}>
                        <div className="relative h-[70vh] bg-cover bg-center" style={{ backgroundImage: `url('${slide.imageUrl}')` }}>
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white p-4">
                                <h1 className="text-7xl font-heading font-bold tracking-tight drop-shadow-lg animate-fade-in-down">{slide.title}</h1>
                                <p className="mt-4 text-2xl max-w-3xl drop-shadow-md animate-fade-in-up font-body">{slide.tagline}</p>
                                <Link to="/products" className="mt-8 bg-amber-600 text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-amber-500 transition duration-300 shadow-xl transform hover:scale-105 animate-fade-in font-body">
                                    Jelajahi Kopi Kami
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default HeroSection;
