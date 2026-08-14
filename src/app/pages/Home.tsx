import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Play, Star, ChevronLeft, ChevronRight, CheckCircle, Home as HomeIcon, Building2, Wrench, Palette, ShieldCheck, Award } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import heroBg from "../../assets/hero-bg.jpg";
import homeAboutImg from "../../assets/home-about.png";

type FeaturedProject = {
  id: number;
  title: string;
  category: "House" | "Construction";
  load: () => Promise<string>;
};

const HERO_IMG = heroBg;
const ABOUT_IMG = homeAboutImg;
const REVIEWS_URL = "https://www.google.com/maps/place/BL+Construction+and+design/@12.8946557,79.1288658,17z/data=!4m18!1m9!3m8!1s0x3bad3900361f4713:0x191e58f4cda78c23!2sBL+Construction+and+design!8m2!3d12.8946557!4d79.1314407!9m1!1b1!16s%2Fg%2F11y54zscr0!3m7!1s0x3bad3900361f4713:0x191e58f4cda78c23!8m2!3d12.8946557!4d79.1314407!9m1!1b1!16s%2Fg%2F11y54zscr0?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D";

const homeDesignModules = import.meta.glob("/src/assets/photos/house-design/*.{png,jpg,jpeg,webp}", {
  import: "default",
}) as Record<string, () => Promise<string>>;

const homeBuilderModules = import.meta.glob("/src/assets/photos/builders/*.{png,jpg,jpeg,webp}", {
  import: "default",
}) as Record<string, () => Promise<string>>;

const PROJECTS: FeaturedProject[] = [
  ...Object.entries(homeDesignModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 2)
    .map(([, load], index) => ({
      id: index + 1,
      title: "BL House Design",
      category: "House",
      load,
    })),
  ...Object.entries(homeBuilderModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 1)
    .map(([, load], index) => ({
      id: index + 101,
      title: "BL Construction Work",
      category: "Construction",
      load,
    })),
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Balaji",
    rating: 5,
    text: "From the day I stepped into BL Construction and the completion of the project, I had an excellent experience with the entire team. It started with our designer, G. Baskar, who was very professional in designing, customizing, updating, and recommending the best possible choices. Mr. G. Baskar kept his word from design until project completion. They were patient in listening to our needs and customizing everything in the best possible way with useful suggestions. The trustworthy development work and completed project profile were very good.",
  },
  {
    id: 2,
    name: "Karthi Geyan",
    rating: 5,
    text: "BL Constructions delivered excellent service and top-notch craftsmanship. Their team was professional, communicative, and attentive to every detail, ensuring a seamless renovation experience. Highly recommended!",
  },
  {
    id: 3,
    name: "Priya Sree",
    rating: 5,
    text: "Great work!! Always has a new and best model of designs being installed and a marvelous framework of construction. Keep up with the same spirit and grow in life with all successes!",
  },
  {
    id: 4,
    name: "Chaitanya Kambuj",
    rating: 5,
    text: "This construction company provides very professional and high-quality work. The team is skilled, hardworking, and completes projects on time. They use good quality materials and maintain proper safety standards throughout the project. Communication with clients is clear, and they understand customer requirements very well. I highly recommend this company to anyone looking for reliable and trustworthy construction services.",
  },
];

const SERVICES_PREVIEW = [
  { icon: HomeIcon, title: "Residential", desc: "Custom homes built to your exact vision and lifestyle needs." },
  { icon: Building2, title: "Commercial", desc: "Commercial construction delivered with disciplined planning and site coordination." },
  { icon: Wrench, title: "Renovation", desc: "Expert renovation that transforms existing spaces completely." },
  { icon: Palette, title: "Interior Design", desc: "Stunning interiors crafted by award-winning designers." },
  { icon: ShieldCheck, title: "Project Mgmt", desc: "End-to-end project management with clear communication and reliable coordination." },
  { icon: Award, title: "Architecture", desc: "Innovative architectural planning for iconic structures." },
];

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [started, target, duration]);

  return { count, ref };
}

function StatCard({ value, label, suffix = "+" }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "#B88A52", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#6B7280", fontSize: "1rem", marginTop: "0.5rem", fontFamily: "'Inter', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

export function Home() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Array<{ id: number; title: string; category: "House" | "Construction"; img: string }>>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [testimonialIdx]);

  const prev = () => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedProjects() {
      const results = await Promise.all(
        PROJECTS.map(async (project) => ({
          id: project.id,
          title: project.title,
          category: project.category,
          img: await project.load(),
        }))
      );

      if (!cancelled) {
        setFeaturedProjects(results);
      }
    }

    loadFeaturedProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={HERO_IMG}
          alt="Construction site"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.72) saturate(1.02)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(115deg, rgba(30,35,41,0.78) 0%, rgba(30,35,41,0.42) 42%, rgba(30,35,41,0.22) 72%, rgba(30,35,41,0.34) 100%)",
          }}
        />
        {/* Yellow accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: "linear-gradient(to bottom, transparent, #B88A52, transparent)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: "rgba(184,138,82,0.16)", border: "1px solid rgba(184,138,82,0.28)" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#D8B07A" }} />
              <span style={{ color: "#F3E5D0", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                BL Construction and Design
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                color: "white",
                lineHeight: 1.08,
                marginBottom: "1.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              BL Construction<br />
              <span style={{ color: "#E7D5BA" }}>& Design</span>
            </h1>
            <p
              style={{
                color: "#E5E7EB",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                lineHeight: 1.8,
                marginBottom: "2.5rem",
                fontFamily: "'Inter', sans-serif",
                maxWidth: "38rem",
              }}
            >
              BL Construction and Design delivers residential and commercial projects with practical planning, dependable workmanship, and clear communication from start to finish.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: "#B88A52",
                  color: "#FFFDF9",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 18px 50px rgba(184,138,82,0.24)",
                }}
              >
                Free Consultation <ArrowRight size={18} />
              </Link>
              <Link
                to="/projects"
                className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: "2px solid rgba(255,255,255,0.42)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E7D5BA"; (e.currentTarget as HTMLElement).style.color = "#E7D5BA"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
              >
                <Play size={18} /> View Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ backgroundColor: "#EFE7DA", borderTop: "1px solid rgba(92,71,43,0.08)", borderBottom: "1px solid rgba(92,71,43,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value={500} label="Projects Completed" />
            <StatCard value={300} label="Happy Clients" />
            <StatCard value={30} label="Years Experience" />
            <StatCard value={24} label="Support Available" suffix="/7" />
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F8F3EA" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div
                className="absolute -top-4 -left-4 w-full h-full rounded-2xl"
                style={{ border: "2px solid rgba(184,138,82,0.22)" }}
              />
              <ImageWithFallback
                src={ABOUT_IMG}
                alt="About BL Construction and Design"
                className="w-full h-80 lg:h-[500px] object-cover rounded-2xl relative z-10"
                style={{ boxShadow: "0 22px 60px rgba(31,41,51,0.14)" }}
              />
              <div
                className="absolute -bottom-6 -right-6 rounded-xl p-6 z-20"
                style={{ backgroundColor: "#FFFDF9", boxShadow: "0 16px 42px rgba(31,41,51,0.12)", border: "1px solid rgba(92,71,43,0.12)" }}
              >
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#B88A52", lineHeight: 1 }}>30+</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#5E6770", fontWeight: 600 }}>Years of Experience</div>
              </div>
            </div>

            <div>
              <div style={{ color: "#B88A52", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "1rem" }}>
                About BL Construction and Design
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1F2933", lineHeight: 1.15, marginBottom: "1.5rem" }}>
                We Build Spaces That<br />Feel <span style={{ color: "#B88A52" }}>Right to Live In</span>
              </h2>
              <p style={{ color: "#5E6770", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: "1.5rem", fontSize: "1rem" }}>
                BL Construction and Design brings together design thinking, practical site execution, and reliable project coordination. We focus on quality work, clean finishing, and a process clients can trust.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                {["Residential and commercial construction support", "Interior finishing and design coordination", "Clear communication during each project stage", "Reliable execution with practical planning"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle size={18} style={{ color: "#B88A52", flexShrink: 0 }} />
                    <span style={{ color: "#334155", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: "#B88A52",
                  color: "#FFFDF9",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                Learn More <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F2ECE1" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div style={{ color: "#B88A52", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "0.75rem" }}>
              What We Do
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1F2933", lineHeight: 1.15, marginBottom: "1rem" }}>
              Our Core <span style={{ color: "#B88A52" }}>Services</span>
            </h2>
            <p style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif", maxWidth: "38rem", margin: "0 auto", lineHeight: 1.7 }}>
              From home design to builder execution and interior work, our services are shaped around practical needs and clean results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_PREVIEW.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl cursor-pointer transition-all duration-300"
                style={{
                  backgroundColor: hoveredService === i ? "#FFF8EE" : "#FFFDF9",
                  border: hoveredService === i ? "1px solid rgba(184,138,82,0.35)" : "1px solid rgba(92,71,43,0.08)",
                  transform: hoveredService === i ? "translateY(-6px)" : "translateY(0)",
                  boxShadow: hoveredService === i ? "0 22px 55px rgba(31,41,51,0.12)" : "0 10px 25px rgba(31,41,51,0.05)",
                }}
                onMouseEnter={() => setHoveredService(i)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all"
                  style={{
                    backgroundColor: hoveredService === i ? "#B88A52" : "rgba(184,138,82,0.12)",
                  }}
                >
                  <Icon size={24} style={{ color: hoveredService === i ? "#FFFDF9" : "#B88A52" }} />
                </div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#1F2933", fontSize: "1.15rem", marginBottom: "0.75rem" }}>
                  {title}
                </h3>
                <p style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all hover:scale-105"
              style={{
                border: "2px solid #B88A52",
                color: "#B88A52",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#B88A52"; (e.currentTarget as HTMLElement).style.color = "#FFFDF9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#B88A52"; }}
            >
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F8F3EA" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div style={{ color: "#B88A52", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "0.75rem" }}>
                Portfolio
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1F2933", lineHeight: 1.15 }}>
                Featured <span style={{ color: "#B88A52" }}>Design & Build</span>
              </h2>
              <p style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", lineHeight: 1.7, marginTop: "0.9rem", maxWidth: "34rem" }}>
                A quick look at our house design ideas and builder work, presented in a cleaner visual style.
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 transition-all hover:gap-3"
              style={{ color: "#B88A52", fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none" }}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                style={{ height: project.category === "House" ? "360px" : "320px", boxShadow: "0 18px 45px rgba(31,41,51,0.12)" }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <ImageWithFallback
                  src={project.img}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: hoveredProject === project.id ? "scale(1.1)" : "scale(1)" }}
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-5 transition-all duration-300"
                  style={{
                    background: hoveredProject === project.id
                      ? "linear-gradient(to top, rgba(31,41,51,0.88) 0%, rgba(31,41,51,0.18) 100%)"
                      : "linear-gradient(to top, rgba(31,41,51,0.78) 0%, transparent 60%)",
                  }}
                >
                  <div style={{ color: "#E7D5BA", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {project.category}
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>
                    {project.category === "House" ? "Modern House Design" : "Construction Work"}
                  </div>
                  {hoveredProject === project.id && (
                    <Link
                      to="/projects"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm transition-all"
                      style={{ color: "#E7D5BA", fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none" }}
                    >
                      Open Gallery <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F2ECE1" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div style={{ color: "#B88A52", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "0.75rem" }}>
              Review
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1F2933", lineHeight: 1.15 }}>
              What Our Clients <span style={{ color: "#B88A52" }}>Say</span>
            </h2>
            <a
              href={REVIEWS_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#B88A52", fontFamily: "'Inter', sans-serif", fontSize: "0.92rem", fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: "1rem" }}
            >
              View all Google reviews
            </a>
          </div>

          <div className="relative">
            <div
              className="p-10 rounded-3xl max-w-3xl mx-auto text-center"
              style={{
                backgroundColor: "#FFFDF9",
                border: "1px solid rgba(92,71,43,0.1)",
                boxShadow: "0 22px 55px rgba(31,41,51,0.1)",
              }}
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: TESTIMONIALS[testimonialIdx].rating }).map((_, i) => (
                  <Star key={i} size={20} fill="#B88A52" stroke="none" />
                ))}
              </div>
              <p
                style={{
                  color: "#475569",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(1rem, 2vw, 1.15rem)",
                  lineHeight: 1.8,
                  marginBottom: "2rem",
                  fontStyle: "italic",
                }}
              >
                "{TESTIMONIALS[testimonialIdx].text}"
              </p>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#1F2933", fontSize: "1.05rem" }}>
                  {TESTIMONIALS[testimonialIdx].name}
                </div>
                <div style={{ color: "#B88A52", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  Verified Client Review
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(184,138,82,0.25)", color: "#B88A52", boxShadow: "0 8px 20px rgba(31,41,51,0.08)" }}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    style={{
                      width: i === testimonialIdx ? "24px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      backgroundColor: i === testimonialIdx ? "#B88A52" : "rgba(184,138,82,0.24)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: "linear-gradient(135deg, #F8F3EA 0%, #EFE7DA 45%, #F4ECDF 100%)",
          borderTop: "1px solid rgba(92,71,43,0.1)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1F2933", marginBottom: "1rem" }}>
            Ready to Start Your <span style={{ color: "#B88A52" }}>Project?</span>
          </h2>
          <p style={{ color: "#5E6770", fontFamily: "'Inter', sans-serif", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Talk to BL Construction and Design for a free consultation and practical guidance for your next build.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="px-10 py-4 rounded-xl transition-all hover:scale-105"
              style={{
                backgroundColor: "#B88A52",
                color: "#FFFDF9",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 18px 45px rgba(184,138,82,0.24)",
              }}
            >
              Request Consultation
            </Link>
            <Link
              to="/projects"
              className="px-10 py-4 rounded-xl transition-all hover:scale-105"
              style={{
                border: "2px solid rgba(92,71,43,0.16)",
                color: "#334155",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#B88A52"; (e.currentTarget as HTMLElement).style.color = "#B88A52"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(92,71,43,0.16)"; (e.currentTarget as HTMLElement).style.color = "#334155"; }}
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
