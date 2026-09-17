// components/sections/Choose.js
export default function Choose({ content }) {
  if (!content || !content.items) return null;

  return (
    <section style={{ padding: '3rem', textAlign: 'center' }}>
      <h2>{content.title}</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        {content.items.map((item, idx) => (
          <div key={idx} style={{ maxWidth: '200px', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            {item.icon && <img src={item.icon} alt={item.title} style={{ width: '50px', marginBottom: '0.5rem' }} />}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
