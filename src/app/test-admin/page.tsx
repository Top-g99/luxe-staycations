export default function TestAdmin() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ Admin Test Page Working!</h1>
      <p>This page is accessible at /test-admin</p>
      <p>If you can see this, the site is working properly.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
        <h3>Admin Features Available:</h3>
        <ul>
          <li>Property Management</li>
          <li>Destination Management</li>
          <li>Booking Management</li>
          <li>Email System</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </div>
  );
}