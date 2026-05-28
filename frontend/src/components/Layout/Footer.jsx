import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <hr className="rule" />
      <div className="container site-footer__inner">
        <p className="site-footer__line">
          &copy; {year} Network Traffic Music Composer</p>
      </div>
    </footer>
  );
}

export default Footer;
