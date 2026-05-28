import './Header.css';

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="site-header__brand">
          <span className="eyebrow">Multimedia Application</span>
          <span className="site-header__wordmark">
            Network Traffic <em>Music</em> Composer
          </span>
        </div>

        <div className="site-header__meta">
          <span className="site-header__meta-line">SCSS 2026</span>
          <span className="site-header__meta-line site-header__meta-line--muted">
          UNSTPB
          </span>
        </div>
      </div>
      <hr className="rule" />
    </header>
  );
}

export default Header;
