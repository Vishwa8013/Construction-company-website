import { Link } from "react-router";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import { Logo } from "./Logo";

const CONTACT_NUMBER = "8778387924";
const DISPLAY_CONTACT_NUMBER = "+91 87783 87924";
const CONTACT_EMAIL = "blconstructionanddesign@gmail.com";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/BL+Construction+and+design/@12.8948897,79.127065,16.38z/data=!4m10!1m2!2m1!1sBL+Construction+and+design+Kuppam!3m6!1s0x3bad3900361f4713:0x191e58f4cda78c23!8m2!3d12.8946557!4d79.1314407!15sCiFCTCBDb25zdHJ1Y3Rpb24gYW5kIGRlc2lnbiBLdXBwYW1aIyIhYmwgY29uc3RydWN0aW9uIGFuZCBkZXNpZ24ga3VwcGFtkgEUY29uc3RydWN0aW9uX2NvbXBhbnmaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnRPTWxGc1JqTmFSa0poVkVjNE1sSlZiRVpPUmxWNFZEQnNNbUZJWXhBQuABAPoBBAgAEEw!16s%2Fg%2F11y54zscr0?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDMxNywIKXMDSoASAFQAw%3D%3D";
const WHATSAPP_URL = "https://wa.me/918778387924";
const INSTAGRAM_URL = "https://www.instagram.com/bl_builder?igsh=Z3U4cjg3N2g0d2xs";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1E2329", borderTop: "1px solid rgba(216,176,122,0.2)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Logo light />
            </div>
            <p style={{ color: "#C7CDD3", fontSize: "0.9rem", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
              BL Construction and Design delivers dependable construction solutions with practical planning, strong site execution, and clear communication for every project.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Instagram, href: INSTAGRAM_URL, label: "Instagram" },
                { Icon: Phone, href: WHATSAPP_URL, label: "WhatsApp" },
                { Icon: Mail, href: `mailto:${CONTACT_EMAIL}`, label: "Email" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: "rgba(216,176,122,0.14)", color: "#E7D5BA" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#B88A52"; (e.currentTarget as HTMLElement).style.color = "#FFFDF9"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(216,176,122,0.14)"; (e.currentTarget as HTMLElement).style.color = "#E7D5BA"; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#FFFDF9", fontSize: "1rem", marginBottom: "1.25rem" }}>
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
            {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Services", path: "/services" },
                { label: "Projects", path: "/projects" },
                { label: "Contact", path: "/contact" },
                { label: "Portal", path: "/portal" },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{ color: "#C7CDD3", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#E7D5BA"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#C7CDD3"; }}
                  >
                    → {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#FFFDF9", fontSize: "1rem", marginBottom: "1.25rem" }}>
              Our Services
            </h4>
            <ul className="flex flex-col gap-3">
              {["Residential Construction", "Commercial Construction", "Renovation & Remodeling", "Interior Design", "Architecture Planning", "Project Management"].map((s) => (
                <li key={s}>
                  <Link
                    to="/services"
                    style={{ color: "#C7CDD3", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#E7D5BA"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#C7CDD3"; }}
                  >
                    → {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#FFFDF9", fontSize: "1rem", marginBottom: "1.25rem" }}>
              Contact Info
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} style={{ color: "#D8B07A", flexShrink: 0, marginTop: "2px" }} />
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#C7CDD3", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, textDecoration: "none" }}
                >
                  BL Construction and Design<br />Kuppam
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} style={{ color: "#D8B07A", flexShrink: 0 }} />
                <a href={`tel:${CONTACT_NUMBER}`} style={{ color: "#C7CDD3", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
                  {DISPLAY_CONTACT_NUMBER}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} style={{ color: "#D8B07A", flexShrink: 0 }} />
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#C7CDD3", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p style={{ color: "#9FA8B1", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif" }}>
            © 2026 BL Construction and Design. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                style={{ color: "#9FA8B1", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#E7D5BA"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#9FA8B1"; }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
