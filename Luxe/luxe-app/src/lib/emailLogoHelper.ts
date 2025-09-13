// Email Logo Helper for Luxe Staycations
// Provides email-compatible logo solutions

export function getEmailLogoHTML(size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizes = {
    small: { width: '60px', height: '60px', fontSize: '20px' },
    medium: { width: '100px', height: '100px', fontSize: '24px' },
    large: { width: '120px', height: '120px', fontSize: '28px' }
  };

  const { width, height, fontSize } = sizes[size];

  return `
    <div style="
      width: ${width}; 
      height: ${height}; 
      margin: 0 auto; 
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      border: 3px solid #2F4F4F;
    ">
      <span style="
        color: #2F4F4F; 
        font-size: ${fontSize}; 
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
      ">🏖️</span>
    </div>
  `;
}

export function getEmailLogoSection(): string {
  return `
    <div style="
      text-align: center; 
      margin: 20px 0; 
      padding: 20px; 
      background-color: #ffffff; 
      border-radius: 8px;
      border: 2px solid #f0f0f0;
    ">
      ${getEmailLogoHTML('medium')}
      <h3 style="
        color: #5a3d35; 
        margin: 15px 0 0 0; 
        font-size: 18px; 
        font-weight: 600;
        letter-spacing: 1px;
      ">LUXE STAYCATIONS</h3>
      <p style="
        color: #d97706; 
        margin: 5px 0 0 0; 
        font-size: 12px; 
        font-weight: 500;
        letter-spacing: 2px;
      ">LUXURY GETAWAYS</p>
    </div>
  `;
}

export function getEmailLogoCTA(): string {
  return `
    <div style="
      text-align: center; 
      margin: 30px 0; 
      padding: 20px; 
      background-color: #ffffff; 
      border-radius: 8px; 
      border: 2px solid #f0f0f0;
    ">
      ${getEmailLogoHTML('small')}
      <p style="
        color: #5a3d35; 
        font-weight: 600; 
        margin: 15px 0 0 0;
        font-size: 14px;
      ">Luxe Staycations</p>
    </div>
  `;
}
