import React, { useEffect, useState } from 'react';
import { IonButton } from '@ionic/react';

type Props = { onCta?: () => void };

const slides = [
  {
    title: 'Modern Living',
    subtitle: 'Discover comfortable, stylish sofas and more.',
    image: 'https://plus.unsplash.com/premium_photo-1670076513880-f58e3c377903?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZnVybml0dXJlfGVufDB8fDB8fHww',
    cta: 'Shop Now'
  },
  {
    title: 'Work From Home',
    subtitle: 'Ergonomic chairs and desks for your home office.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZnVybml0dXJlfGVufDB8fDB8fHww',
    cta: 'Browse Chairs'
  },
  {
    title: 'Dining Elegance',
    subtitle: 'Tables and sets for memorable meals.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZnVybml0dXJlfGVufDB8fDB8fHww',
    cta: 'See Collections'
  }
];

const HeroSlider: React.FC<Props> = ({ onCta }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex(i => (i + 1) % slides.length);

  const slide = slides[index];

  return (
    <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
      <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))' }} />
      <div style={{ position: 'absolute', left: 16, top: '30%', color: '#fff', right: 16, textAlign: 'left' }}>
        <h2 style={{ margin: 0 }}>{slide.title}</h2>
        <p style={{ marginTop: 8 }}>{slide.subtitle}</p>
        <IonButton className="hero-cta" onClick={() => onCta?.()}>{slide.cta}</IonButton>
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
        <button onClick={prev} className="hero-control">‹</button>
        <button onClick={next} className="hero-control">›</button>
      </div>
    </div>
  );
};

export default HeroSlider;
