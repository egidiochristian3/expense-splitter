import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState({})
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.15 }
    )
    const refs = [featuresRef, statsRef, ctaRef]
    refs.forEach(ref => { if (ref.current) observer.observe(ref.current) })
    return () => observer.disconnect()
  }, [])

  const features = [
    { icon: '💸', title: 'Multi-Currency Support', desc: 'Add expenses in any currency. Balances automatically convert to your group\'s base currency using live exchange rates.' },
    { icon: '⚡', title: 'Real-Time Notifications', desc: 'Instant notifications powered by Socket.io when someone settles their share — no refresh needed.' },
    { icon: '📊', title: 'Spending Analytics', desc: 'Beautiful charts showing spending trends, member breakdowns, and group comparisons to keep everyone informed.' },
    { icon: '🧮', title: 'Flexible Split Modes', desc: 'Split equally, by percentage, or custom amounts. Full control over how every expense is divided.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Full dark mode support across every page. Easy on the eyes, day or night.' },
    { icon: '🔍', title: 'Search & History', desc: 'Search expenses across all groups and view your complete settlement history in one place.' },
  ]

  const stats = [
    { value: '170+', label: 'Currencies supported' },
    { value: '3', label: 'Split modes' },
    { value: '8', label: 'Pages & features' },
    { value: '100%', label: 'Real-time' },
  ]

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-bg {
          background: linear-gradient(-45deg, #0f172a, #1e1b4b, #1e3a5f, #0f172a);
          background-size: 400% 400%;
          animation: gradientShift 10s ease infinite;
        }
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(59,130,246,0.2);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          transition: all 0.3s ease;
          background-size: 200% 200%;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99,102,241,0.4);
          background-position: right center;
        }
        .btn-secondary {
          transition: all 0.3s ease;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-2px);
        }
        .stat-card {
          animation: countUp 0.6s ease forwards;
        }
        .emoji-float {
          animation: floatEmoji ease-in-out infinite;
        }
        .section-visible {
          animation: fadeUp 0.8s ease forwards;
        }
        .section-hidden {
          opacity: 0;
          transform: translateY(40px);
        }
        .shimmer-text {
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 50 ? 'rgba(15,23,42,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>💸</div>
          <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>SplitEase</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary"
            style={{
              color: 'white', background: 'transparent',
              padding: '8px 20px', borderRadius: 8,
              cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}
          >Login</button>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary"
            style={{
              color: 'white', border: 'none',
              padding: '8px 20px', borderRadius: 8,
              cursor: 'pointer', fontSize: 14, fontWeight: 600
            }}
          >Get Started</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-bg" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '100px 20px 60px'
      }}>
        {/* Floating background emojis */}
        {['💸', '💰', '🧾', '💳', '🪙', '💵', '📊', '💹'].map((emoji, i) => (
          <div key={i} className="emoji-float" style={{
            position: 'absolute',
            left: `${8 + i * 12}%`,
            top: `${15 + (i % 3) * 25}%`,
            fontSize: 24 + (i % 3) * 10,
            opacity: 0.15,
            animationDuration: `${4 + i * 0.7}s`,
            animationDelay: `${i * 0.3}s`,
            pointerEvents: 'none'
          }}>{emoji}</div>
        ))}

        {/* Glowing orbs */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '10%', left: '-10%', pointerEvents: 'none'
        }}/>
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          bottom: '10%', right: '-5%', pointerEvents: 'none'
        }}/>

        {/* Badge */}
        <div style={{
          background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
          color: '#a5b4fc', padding: '6px 16px', borderRadius: 20,
          fontSize: 13, fontWeight: 500, marginBottom: 24,
          animation: 'fadeIn 1s ease forwards'
        }}>
          ✨ Full-Stack MERN Application
        </div>

        {/* Main heading */}
        <h1 style={{
          color: 'white', textAlign: 'center', maxWidth: 700,
          fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800,
          lineHeight: 1.1, marginBottom: 24,
          animation: 'fadeUp 0.8s ease 0.2s forwards', opacity: 0
        }}>
          Split expenses,{' '}
          <span className="shimmer-text">not friendships</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'rgba(148,163,184,1)', textAlign: 'center',
          maxWidth: 560, fontSize: 18, lineHeight: 1.7, marginBottom: 40,
          animation: 'fadeUp 0.8s ease 0.4s forwards', opacity: 0
        }}>
          The smart way to manage group expenses with real-time settlements,
          live currency conversion, and beautiful analytics — all in one place.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.8s ease 0.6s forwards', opacity: 0
        }}>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary"
            style={{
              color: 'white', border: 'none',
              padding: '14px 32px', borderRadius: 12,
              cursor: 'pointer', fontSize: 16, fontWeight: 700,
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)'
            }}
          >
            Start Splitting Free →
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary"
            style={{
              color: 'white', background: 'transparent',
              padding: '14px 32px', borderRadius: 12,
              cursor: 'pointer', fontSize: 16, fontWeight: 600
            }}
          >
            Sign In
          </button>
        </div>

        {/* Hero mockup card */}
        <div style={{
          marginTop: 60, maxWidth: 680, width: '100%',
          animation: 'fadeUp 0.8s ease 0.8s forwards', opacity: 0
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: 24, backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>GOA TRIP 🏖️</div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>4 members · USD</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['C', 'E', 'J', 'S'].map((l, i) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `hsl(${i * 60 + 200}, 70%, 55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 700,
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>{l}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'You are owed', value: 'USD 450.00', color: '#22c55e' },
                { label: 'You owe', value: 'USD 120.00', color: '#ef4444' },
                { label: 'Net balance', value: 'USD 330.00', color: '#3b82f6' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.06)', borderRadius: 10,
                  padding: '12px', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontWeight: 700, fontSize: 14 }}>{stat.value}</div>
                </div>
              ))}
            </div>
            {[
              { name: 'Hotel booking', amount: 'USD 800.00', by: 'Christian', type: 'equal', status: 'Pending' },
              { name: 'Beach dinner', amount: 'USD 240.00', by: 'Egidio', type: 'custom', status: 'Settled' },
            ].map((exp, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px',
                marginBottom: 8, border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{exp.name}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>Paid by {exp.by} · {exp.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{exp.amount}</div>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                    background: exp.status === 'Settled' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                    color: exp.status === 'Settled' ? '#22c55e' : '#eab308'
                  }}>{exp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(148,163,184,0.6)', fontSize: 12, textAlign: 'center',
          animation: 'pulse 2s ease infinite'
        }}>
          <div>↓ Scroll to explore</div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section ref={statsRef} id="stats" style={{
        background: '#0f172a', padding: '60px 40px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20
        }}>
          {stats.map((stat, i) => (
            <div key={i} className={visibleSections.stats ? 'stat-card' : ''} style={{
              textAlign: 'center', opacity: visibleSections.stats ? 1 : 0,
              animationDelay: `${i * 0.15}s`
            }}>
              <div style={{
                fontSize: 42, fontWeight: 800, marginBottom: 8,
                background: 'linear-gradient(135deg, #3b82f6, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: 14 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section ref={featuresRef} id="features" style={{
        background: '#0f172a', padding: '80px 40px'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className={visibleSections.features ? 'section-visible' : 'section-hidden'}
            style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 16
            }}>
              Everything you need to{' '}
              <span className="shimmer-text">split smarter</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
              Powerful features designed to make group expense management effortless.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24
          }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 28,
                opacity: visibleSections.features ? 1 : 0,
                animation: visibleSections.features ? `fadeUp 0.6s ease ${i * 0.1}s forwards` : 'none'
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section ref={ctaRef} id="cta" style={{
        background: 'linear-gradient(135deg, #1e1b4b, #1e3a5f)',
        padding: '100px 40px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className={visibleSections.cta ? 'section-visible' : 'section-hidden'}
          style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🚀</div>
          <h2 style={{ color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
            Ready to split smarter?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
            Join thousands of groups already using SplitEase to manage
            their shared expenses with ease and transparency.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary"
              style={{
                color: 'white', border: 'none',
                padding: '16px 40px', borderRadius: 12,
                cursor: 'pointer', fontSize: 18, fontWeight: 700,
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
              }}
            >
              Create Free Account →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary"
              style={{
                color: 'white', background: 'transparent',
                padding: '16px 40px', borderRadius: 12,
                cursor: 'pointer', fontSize: 18, fontWeight: 600
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#020617', padding: '30px 40px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>💸</span>
          <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>SplitEase</span>
          <span style={{ color: '#334155', fontSize: 13 }}>— Split expenses, not friendships</span>
        </div>
        <div style={{ color: '#334155', fontSize: 13 }}>
          Built with React · Node.js · MongoDB · Socket.io
        </div>
      </footer>
    </div>
  )
}

export default Landing