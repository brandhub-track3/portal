import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="topbar">
      <div className="container nav-shell">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <span className="brand-mark">B</span>
          <span>BrandHub</span>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/demo">Book a demo</Link>
        </nav>
      </div>
    </header>
  )
}
