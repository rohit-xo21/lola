export default function Login() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        .login-root { min-height: 100vh; display: flex; background-color: #1e232a; font-family: 'DM Sans', sans-serif; }
        .login-left { display: none; flex-direction: column; justify-content: space-between; padding: 40px 48px; background: #222831; border-right: 1px solid #393E46; width: 420px; flex-shrink: 0; }
        @media (min-width: 900px) { .login-left { display: flex; } }
        .login-left-quote { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0; }
        .login-left-headline { font-family: 'Playfair Display', serif; font-size: clamp(28px, 3vw, 38px); font-weight: 700; color: #DFD0B8; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 20px; }
        .login-left-headline em { font-style: italic; color: #948979; }
        .login-left-desc { font-size: 13px; color: #948979; line-height: 1.75; font-weight: 300; max-width: 280px; }
        .login-left-features { display: flex; flex-direction: column; gap: 10px; padding-top: 32px; border-top: 1px solid #393E46; }
        .login-left-feature { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #948979; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }
        .login-left-feature-dot { width: 4px; height: 4px; border-radius: 50%; background: #948979; flex-shrink: 0; }
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
        .login-form-wrap { width: 100%; max-width: 360px; }
        .login-mobile-logo { display: flex; margin-bottom: 48px; }
        @media (min-width: 900px) { .login-mobile-logo { display: none; } }
        .login-eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #948979; margin-bottom: 10px; display: block; }
        .login-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #DFD0B8; line-height: 1.15; letter-spacing: -0.01em; margin-bottom: 8px; }
        .login-title em { font-style: italic; color: #948979; }
        .login-subtitle { font-size: 13px; color: #948979; margin-bottom: 40px; font-weight: 300; line-height: 1.6; }
        .login-google { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 14px; background: #DFD0B8; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; color: #222831; text-decoration: none; cursor: pointer; transition: background 0.15s; box-sizing: border-box; }
        .login-google:hover { background: #f0e5d0; }
        .login-drive-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; padding: 9px 16px; background: rgba(57,62,70,0.35); border: 1px solid #393E46; border-radius: 20px; font-size: 11px; color: #948979; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }
        .login-notice { margin-top: 16px; text-align: center; font-size: 11px; color: #948979; font-family: 'DM Mono', monospace; line-height: 1.8; opacity: 0.6; }
      `}</style>

      <div className="login-root">
        <div className="login-left">
          <div><img src="/logobrand.svg" alt="Lola" style={{ maxWidth: '180px', height: 'auto', display: 'block' }} /></div>
          <div className="login-left-quote">
            <h2 className="login-left-headline">Your second<br /><em>memory.</em></h2>
            <p className="login-left-desc">Save links, notes, PDFs, and images. Let AI summarize, tag, and index everything so you can find it when it matters.</p>
          </div>
          <div className="login-left-features">
            {['AI summarization', 'Full-text search', 'Smart tagging', 'Cloud file storage'].map((f) => (
              <div key={f} className="login-left-feature"><span className="login-left-feature-dot" />{f}</div>
            ))}
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrap">
            <div className="login-mobile-logo">
              <img src="/logobrand.svg" alt="Lola" style={{ maxWidth: '140px', height: 'auto', display: 'block' }} />
            </div>
            <span className="login-eyebrow">Welcome</span>
            <h1 className="login-title">Sign in to<br /><em>your vault.</em></h1>
            <p className="login-subtitle">Your bookmarks, organized by AI and stored in the cloud.</p>
            <a href="http://localhost:5000/auth/google" className="login-google">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 30 30" fill="#948979">
                <path d="M 15.003906 3 C 8.3749062 3 3 8.373 3 15 C 3 21.627 8.3749062 27 15.003906 27 C 25.013906 27 27.269078 17.707 26.330078 13 L 25 13 L 22.732422 13 L 15 13 L 15 17 L 22.738281 17 C 21.848702 20.448251 18.725955 23 15 23 C 10.582 23 7 19.418 7 15 C 7 10.582 10.582 7 15 7 C 17.009 7 18.839141 7.74575 20.244141 8.96875 L 23.085938 6.1289062 C 20.951937 4.1849063 18.116906 3 15.003906 3 z"/>
              </svg>
              Continue with Google
            </a>
            <div className="login-drive-badge" style={{display:'none'}}>
              <svg width="13" height="11" viewBox="0 0 87.3 78" fill="none">
                <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 51H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
                <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0c-1.55 0-3.1.4-4.45 1.2L6.6 11.15c-1.4.8-2.5 1.95-3.3 3.3L27.5 51l16.15-26z" fill="#00AC47"/>
                <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60l5.4 9.35 8.15 14.45z" fill="#EA4335"/>
                <path d="M43.65 25L59.8 51H87.3c0-1.55-.4-3.1-1.2-4.5L72.35 22.1C71.55 20.7 70.4 19.6 69.05 18.8L55.2 27.35 43.65 25z" fill="#00832D"/>
                <path d="M60 51H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.6c1.55 0 3.1-.4 4.45-1.2L60 51z" fill="#2684FC"/>
                <path d="M43.65 25L55.2 27.35 69.05 18.8c-1.35-.8-2.9-1.2-4.45-1.2H22.75c-1.55 0-3.1.4-4.35 1.2L29.9 1.2 43.65 25z" fill="#FFBA00"/>
              </svg>
              Files are stored in the cloud
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
