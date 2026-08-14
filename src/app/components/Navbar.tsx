import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "./Logo";

const CONTACT_NUMBER = "8778387924";
const DISPLAY_CONTACT_NUMBER = "+91 87783 87924";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Projects", path: "/projects" },
  { label: "Contact", path: "/contact" },
  { label: "Portal", path: "/portal" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(248,243,234,0.94)" : "rgba(248,243,234,0.72)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(92,71,43,0.12)" : "1px solid rgba(92,71,43,0.08)",
        boxShadow: scrolled ? "0 16px 45px rgba(31,41,51,0.08)" : "none",
      }}
    >
      <div
        className="hidden md:block"
        style={{
          backgroundColor: scrolled ? "rgba(237,230,218,0.92)" : "rgba(248,243,234,0.76)",
          borderBottom: "1px solid rgba(92,71,43,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 flex items-center justify-between">
            <div style={{ color: "#5E6770", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", letterSpacing: "0.05em" }}>
              Call {DISPLAY_CONTACT_NUMBER} for residential and commercial construction enquiries
            </div>
            <a
              href={`tel:${CONTACT_NUMBER}`}
              className="flex items-center gap-2"
              style={{ color: "#B88A52", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", textDecoration: "none", fontWeight: 700 }}
            >
              <Phone size={14} />
              {DISPLAY_CONTACT_NUMBER}
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo compact />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.path === "/" ? location.pathname === "/" : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    color: isActive ? "#B88A52" : "#334155",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    transition: "all 0.2s",
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.target as HTMLElement).style.color = "#B88A52"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.target as HTMLElement).style.color = "#334155"; }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "20px",
                        height: "2px",
                        backgroundColor: "#B88A52",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/contact"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
                backgroundColor: "#B88A52",
                color: "#FFFDF9",
                padding: "0.6rem 1.5rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                transition: "all 0.2s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = "#9D7243"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "#B88A52"; }}
            >
              Free Consultation
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: "#B88A52" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            backgroundColor: "rgba(248,243,234,0.98)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(92,71,43,0.12)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = link.path === "/" ? location.pathname === "/" : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: "1rem",
                    color: isActive ? "#B88A52" : "#334155",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    backgroundColor: isActive ? "rgba(184,138,82,0.08)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/contact"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                backgroundColor: "#B88A52",
                color: "#FFFDF9",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              Free Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
