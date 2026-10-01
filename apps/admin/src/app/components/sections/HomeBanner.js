// components/sections/HomeBanner.js
export default function HomeBanner({ content }) {
  if (!content) return null;

  return (
    <section style={{ padding: '4rem', backgroundColor: content.backgroundColor || '#f0f0f0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem' }}>{content.title}</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>{content.subtitle}</p>
      {content.buttonText && content.buttonLink && (
        <a
          href={content.buttonLink}
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none'
          }}
        >
          {content.buttonText}
        </a>
      )}
    </section>
  );
}
