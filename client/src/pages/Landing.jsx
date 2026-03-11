import { Link } from 'react-router-dom';
import { Zap, Tags, Search, Lock, ArrowRight, FileText, Image, Monitor } from 'lucide-react';

export default function Landing() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

        :root {
          --bg: #1e232a;
          --surface: #222831;
          --border: #393E46;
          --stone: #948979;
          --cream: #DFD0B8;
          --muted: #4a5260;
        }

        .landing-root {
          min-height: 100vh;
          background-color: var(--bg);
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(57,62,70,0.18) 39px,
              rgba(57,62,70,0.18) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(57,62,70,0.1) 39px,
              rgba(57,62,70,0.1) 40px
            );
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Nav */
        .l-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          max-width: 1080px;
          width: 100%;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .l-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .l-logo-mark {
          width: 30px;
          height: 30px;
          background: var(--cream);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .l-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--cream);
          letter-spacing: -0.01em;
        }

        .l-nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .l-nav-ghost {
          font-size: 13px;
          color: var(--stone);
          text-decoration: none;
          transition: color 0.15s;
          font-weight: 400;
        }

        .l-nav-ghost:hover { color: var(--cream); }

        .l-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--bg);
          background: var(--cream);
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: background 0.15s;
          letter-spacing: 0.02em;
        }

        .l-nav-cta:hover { background: #f0e5d0; }

        /* Hero */
        .l-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 32px 60px;
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
        }

        .l-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--stone);
          border: 1px solid var(--border);
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 36px;
        }

        .l-eyebrow-dot {
          width: 5px;
          height: 5px;
          background: var(--stone);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .l-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 7vw, 72px);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--cream);
          margin-bottom: 8px;
        }

        .l-h1-italic {
          font-style: italic;
          color: var(--stone);
        }

        .l-sub {
          font-size: 16px;
          color: var(--stone);
          line-height: 1.7;
          max-width: 480px;
          margin: 24px auto 40px;
          font-weight: 300;
        }

        .l-ctas {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .l-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--cream);
          color: var(--bg);
          font-size: 13px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }

        .l-cta-primary:hover {
          background: #f0e5d0;
          
        }

        .l-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--stone);
          font-family: 'DM Mono', monospace;
          text-decoration: none;
          padding: 12px 20px;
          border: 1px solid var(--border);
          border-radius: 10px;
          transition: border-color 0.15s, color 0.15s;
        }

        .l-cta-secondary:hover {
          border-color: var(--stone);
          color: var(--cream);
        }

        /* Divider */
        .l-divider {
          max-width: 1080px;
          width: 100%;
          margin: 0 auto;
          border: none;
          border-top: 1px solid var(--border);
          padding: 0 32px;
        }

        /* Features */
        .l-features {
          max-width: 1080px;
          width: 100%;
          margin: 0 auto;
          padding: 64px 32px 80px;
        }

        .l-features-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 40px;
        }

        .l-features-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 400;
          font-style: italic;
          color: var(--stone);
        }

        .l-features-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .l-features-count {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.1em;
        }

        .l-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        @media (max-width: 680px) {
          .l-grid { grid-template-columns: 1fr; }
        }

        .l-feature {
          background: var(--surface);
          padding: 28px 24px;
          transition: background 0.15s;
          position: relative;
        }

        .l-feature:hover {
          background: #252d36;
        }

        .l-feature-num {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.1em;
          margin-bottom: 20px;
          display: block;
        }

        .l-feature-icon {
          color: var(--stone);
          margin-bottom: 14px;
        }

        .l-feature-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--cream);
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }

        .l-feature-desc {
          font-size: 12px;
          color: var(--stone);
          line-height: 1.7;
          font-weight: 300;
        }

        /* Footer */
        .l-footer {
          border-top: 1px solid var(--border);
          padding: 24px 32px;
          max-width: 1080px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .l-footer-left {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .l-footer-right {
          font-size: 11px;
          color: var(--muted);
        }

        /* Mobile — hide interactive elements, show notice */
        .l-mobile-notice {
          display: none;
        }

        @media (max-width: 768px) {
          .l-nav-links { display: none; }
          .l-ctas { display: none; }

          .l-mobile-notice {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(57,62,70,0.35);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 18px;
            margin: 24px auto 0;
            max-width: 380px;
            width: calc(100% - 48px);
          }

          .l-mobile-notice-icon {
            flex-shrink: 0;
            color: var(--stone);
          }

          .l-mobile-notice-text {
            font-size: 12px;
            color: var(--stone);
            line-height: 1.6;
            font-weight: 300;
          }

          .l-mobile-notice-text strong {
            color: var(--cream);
            font-weight: 500;
            display: block;
            margin-bottom: 2px;
          }

          .l-h1 { font-size: clamp(36px, 10vw, 52px); }
          .l-hero { padding: 48px 24px 40px; }
          .l-features { padding: 40px 24px 60px; }
          .l-footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div className="landing-root">

        {/* Nav */}
        <nav className="l-nav">
          <div className="l-logo">
          <img src="/logobrand.svg" alt="Lola" style={{ maxWidth: '160px', height: '46px', display: 'block' }} />
          </div>
          <div className="l-nav-links">
            <Link to="/login" className="l-nav-cta">
              Get started <ArrowRight size={12} />
            </Link>
          </div>
        </nav>

        {/* Mobile-only notice */}
        <div className="l-mobile-notice">
          <span className="l-mobile-notice-icon"><Monitor size={18} /></span>
          <div className="l-mobile-notice-text">
            <strong>Desktop only</strong>
            Lola is designed for desktop browsers. Open it on a computer for the full experience.
          </div>
        </div>

        {/* Hero */}
        <section className="l-hero">
          <div className="l-eyebrow">
            <span className="l-eyebrow-dot" />
            AI-powered bookmark manager
          </div>

          <h1 className="l-h1">
            Save everything.<br />
            <span className="l-h1-italic">Find anything.</span>
          </h1>

          <p className="l-sub">
            Lola quietly summarizes, tags, and indexes every link, PDF, and image you save — so your memory never fails you.
          </p>

          <div className="l-ctas">
            <Link to="/login" className="l-cta-primary">
              Start for free <ArrowRight size={13} />
            </Link>
            <a
              href="https://github.com/rohit-xo21/lola"
              target="_blank"
              rel="noreferrer"
              className="l-cta-secondary"
            >
              GitHub ↗
            </a>
          </div>
        </section>

        <hr className="l-divider" />

        {/* Features */}
        <section className="l-features">
          <div className="l-features-header">
            <span className="l-features-title">What it does</span>
            <div className="l-features-line" />
            <span className="l-features-count">06 features</span>
          </div>

          <div className="l-grid">
            {[
              {
                icon: <Zap size={15} />,
                title: 'AI Summarization',
                desc: 'Every link, PDF, or image is automatically summarized and tagged by Groq LLM.',
              },
              {
                icon: <Search size={15} />,
                title: 'Full-text Search',
                desc: 'Instantly search across all your saved content — titles, summaries, and tags.',
              },
              {
                icon: <Tags size={15} />,
                title: 'Smart Tagging',
                desc: 'AI extracts categories and tags automatically. Organize without lifting a finger.',
              },
              {
                icon: <Image size={15} />,
                title: 'OCR for Images',
                desc: 'Upload screenshots or photos — text is extracted and made fully searchable.',
              },
              {
                icon: <FileText size={15} />,
                title: 'PDF Support',
                desc: 'Save PDFs and get AI-generated summaries with key points extracted.',
              },
              {
                icon: <Lock size={15} />,
                title: 'Self-hosted',
                desc: 'Your data stays yours. Run Lola on your own server with your own MongoDB.',
              },
            ].map((f, i) => (
              <div key={f.title} className="l-feature">
                <span className="l-feature-num">0{i + 1}</span>
                <div className="l-feature-icon">{f.icon}</div>
                <div className="l-feature-title">{f.title}</div>
                <p className="l-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="l-footer">
          <span className="l-footer-left">Lola · Self-hosted</span>
          <span className="l-footer-right">Built with ♥</span>
        </footer>

      </div>
    </>
  );
}