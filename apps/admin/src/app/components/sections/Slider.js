'use client';

// components/sections/Slider.js
import { useState } from 'react';

export default function Slider({ content }) {
  const [current, setCurrent] = useState(0);

  if (!content || !content.slides || content.slides.length === 0) return null;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % content.slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + content.slides.length) % content.slides.length);

  return (
    <section style={{ position: 'relative', padding: '2rem', textAlign: 'center', overflow: 'hidden' }}>
      <div>
        <img src={content.slides[current].image} alt={content.slides[current].title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} />
        <h3 style={{ marginTop: '1rem' }}>{content.slides[current].title}</h3>
        <p>{content.slides[current].description}</p>
      </div>
      <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '10px' }}>◀</button>
      <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '10px' }}>▶</button>
    </section>
  );
}
