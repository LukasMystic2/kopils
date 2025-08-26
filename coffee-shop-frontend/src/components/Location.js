import React from 'react';

const Location = () => {
    return (
        <section className="my-16">
            <h2 className="text-5xl font-heading font-bold text-white mb-12 text-center">Our Home</h2>
            <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-xl">
                <iframe 
                    title="KopiLS Store Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.554091197809!2d112.64039787588825!3d-7.941549679104652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd629c012e59deb%3A0xb7ebd676c69e1a79!2sKopi%20Luwak%20Satria%20(LS)!5e0!3m2!1sen!2sid!4v1755188687224!5m2!1sen!2sid" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        </section>
    );
};

export default Location;
