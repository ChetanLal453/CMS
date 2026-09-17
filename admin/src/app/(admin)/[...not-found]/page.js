// src/app/(admin)/[...not-found]/page.js
export default function NotFound() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>404 - Admin Page Not Found</h1>
      <p>The page you are looking for does not exist in the admin section.</p>
    </div>
  );
}
