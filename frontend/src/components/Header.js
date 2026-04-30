import React from 'react';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">♥</div>
          <div>
            CardioML
            <span className="logo-sub">Heart Disease Predictor</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={onToggleTheme}>
            {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}
