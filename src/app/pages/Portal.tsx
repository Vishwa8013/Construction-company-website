import { Link } from "react-router";
import { ArrowRight, Globe, ShieldCheck, Upload } from "lucide-react";

const PUBLIC_SITE_URL =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://blconstructions.in";

function ActionCard({
  title,
  description,
  href,
  buttonLabel,
  icon: Icon,
  external = false,
}: {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  icon: typeof Globe;
  external?: boolean;
}) {
  const content = (
    <div
      className="rounded-[2rem] p-7 sm:p-8 h-full"
      style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(92,71,43,0.08)", boxShadow: "0 22px 55px rgba(31,41,51,0.08)" }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: "#F8F3EA", color: "#8B5E34" }}>
        <Icon size={26} />
      </div>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.8rem", color: "#1F2933" }}>
        {title}
      </h2>
      <p style={{ color: "#5E6770", lineHeight: 1.75, marginBottom: "1.5rem" }}>
        {description}
      </p>
      <span
        className="inline-flex items-center gap-2 rounded-2xl px-5 py-3"
        style={{ backgroundColor: "#8B5E34", color: "#FFFDF9", fontWeight: 700, textDecoration: "none" }}
      >
        {buttonLabel}
        <ArrowRight size={16} />
      </span>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }

  return (
    <Link to={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  );
}

export function Portal() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f6f1e8 0%, #efe7da 100%)", color: "#1F2933" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div style={{ color: "#8B5E34", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.9rem" }}>
            Admin & Public Access
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.08, marginBottom: "1rem" }}>
            Choose the page you want to open
          </h1>
          <p style={{ color: "#5E6770", lineHeight: 1.75 }}>
            Use the admin panel to upload and manage files, or open the public hosted website where the gallery is shown for visitors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActionCard
            title="Admin Page"
            description="Login here to upload images, videos, and PDFs, and manage your backend content."
            href="/adminblc"
            buttonLabel="Open Admin"
            icon={ShieldCheck}
          />
          <ActionCard
            title="Public Site"
            description={`Open the hosted public website at ${PUBLIC_SITE_URL} where visitors see the main gallery.`}
            href={PUBLIC_SITE_URL}
            buttonLabel="Open Public Site"
            icon={Globe}
            external
          />
        </div>

        <div className="mt-8 rounded-[1.75rem] p-6 sm:p-7" style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(92,71,43,0.08)" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div style={{ color: "#8B5E34", fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.4rem" }}>
                Upload Flow
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>Upload once, show on the public site</div>
              <div style={{ color: "#5E6770", lineHeight: 1.7 }}>
                New uploads go into the backend first. After deployment, the public site should load those uploads from the live backend.
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#F8F3EA", color: "#334155", fontWeight: 700 }}>
              <Upload size={16} />
              Backend uploads enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
