import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/avatar',    icon: 'ri-user-star-line',   activeIcon: 'ri-user-star-fill',   label: '分身' },
  { path: '/matching',  icon: 'ri-radar-line',        activeIcon: 'ri-radar-line',        label: '匹配' },
  { path: '/community', icon: 'ri-planet-line',       activeIcon: 'ri-planet-fill',       label: '社区' },
  { path: '/settings',  icon: 'ri-settings-3-line',   activeIcon: 'ri-settings-3-fill',   label: '设置' },
];

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)', paddingLeft: '20px', paddingRight: '20px' }}
    >
      {/* Floating dock */}
      <div
        className="pointer-events-auto flex items-center w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(24,22,52,0.78) 0%, rgba(16,14,38,0.85) 60%, rgba(20,18,48,0.78) 100%)',
          backdropFilter: 'blur(36px) saturate(240%) brightness(1.06)',
          WebkitBackdropFilter: 'blur(36px) saturate(240%) brightness(1.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.16),
            inset 0 -1px 0 rgba(0,0,0,0.28),
            0 10px 40px rgba(0,0,0,0.6),
            0 2px 8px rgba(0,0,0,0.4),
            0 0 0 0.5px rgba(108,92,231,0.15)
          `,
          height: '64px',
        }}
      >
        {TABS.map((tab, idx) => {
          const isActive = location.pathname === tab.path;
          const isLast = idx === TABS.length - 1;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 active:scale-90 relative"
              style={{ background: 'none', border: 'none', padding: '0' }}
            >
              {/* Divider */}
              {!isLast && (
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.06)' }}
                />
              )}

              {/* Active highlight pill — tighter padding so label has room */}
              {isActive && (
                <div
                  className="absolute rounded-2xl"
                  style={{
                    inset: '8px 6px',
                    background: 'linear-gradient(135deg, rgba(108,92,231,0.36) 0%, rgba(0,209,255,0.20) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,209,255,0.25)',
                    boxShadow: '0 0 12px rgba(108,92,231,0.22), inset 0 1px 0 rgba(255,255,255,0.12)',
                  }}
                />
              )}

              {/* Icon */}
              <div className="relative flex items-center justify-center w-6 h-6 mb-0.5">
                <i
                  className={isActive ? tab.activeIcon : tab.icon}
                  style={{
                    fontSize: '17px',
                    color: isActive ? '#00D1FF' : 'rgba(224,239,255,0.48)',
                    transition: 'color 0.2s, transform 0.2s',
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    display: 'block',
                    filter: isActive ? 'drop-shadow(0 0 5px rgba(0,209,255,0.5))' : 'none',
                  }}
                />
              </div>

              {/* Label — Inter font, light weight for inactive, medium for active */}
              <span
                className="relative whitespace-nowrap"
                style={{
                  fontFamily: "'Inter','Noto Sans SC',sans-serif",
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.02em',
                  color: isActive ? '#E0EFFF' : 'rgba(224,239,255,0.42)',
                  transition: 'color 0.2s, font-weight 0.2s',
                  lineHeight: 1,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
