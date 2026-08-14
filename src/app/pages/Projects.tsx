import { useEffect, useMemo, useState } from "react";
import { Play, FolderOpen, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type ProjectCategory = "House Design" | "Construction" | "Interior Design" | "Videos";

type MediaProject = {
  id: string;
  category: ProjectCategory;
  media: string;
  type: "image" | "video";
};

type MediaProjectEntry = {
  id: string;
  category: ProjectCategory;
  type: "image" | "video";
  load: () => Promise<string>;
};

type BackendProject = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  type: "image" | "video" | "document";
  url: string;
  originalName: string;
  createdAt: string;
};

const CATEGORY_CONFIG: Record<
  ProjectCategory,
  {
    folder: string;
    description: string;
    badge: string;
  }
> = {
  "House Design": {
    folder: "src/assets/photos/house-design",
    description: "Front elevation, design ideas, exterior views, and finished house visuals.",
    badge: "House",
  },
  Construction: {
    folder: "src/assets/photos/builders",
    description: "Construction progress, structural work, site execution, and completed project work.",
    badge: "Construction",
  },
  "Interior Design": {
    folder: "src/assets/photos/interior-design",
    description: "House interior design, ceiling details, staircase work, and room finishing visuals.",
    badge: "Interior Design",
  },
  Videos: {
    folder: "src/assets/photos/videos",
    description: "Walkthrough clips, site videos, and project presentation reels.",
    badge: "Video",
  },
};

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:4000";

const imageModules = import.meta.glob("/src/assets/photos/house-design/*.{png,jpg,jpeg,webp}", {
  import: "default",
}) as Record<string, () => Promise<string>>;

const builderModules = import.meta.glob("/src/assets/photos/builders/*.{png,jpg,jpeg,webp}", {
  import: "default",
}) as Record<string, () => Promise<string>>;

const interiorModules = import.meta.glob("/src/assets/photos/interior-design/*.{png,jpg,jpeg,webp}", {
  import: "default",
}) as Record<string, () => Promise<string>>;

const videoThumbModules = import.meta.glob("/src/assets/photos/videos/*.{png,jpg,jpeg,webp,mp4,mov,webm}", {
  import: "default",
}) as Record<string, () => Promise<string>>;

function createProjects(
  category: ProjectCategory,
  entries: Record<string, () => Promise<string>>,
  type: "image" | "video"
) : MediaProjectEntry[] {
  return Object.entries(entries)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, load]) => ({
      id: path,
      category,
      load,
      type,
    }));
}

const PROJECTS: MediaProjectEntry[] = [
  ...createProjects("House Design", imageModules, "image"),
  ...createProjects("Construction", builderModules, "image"),
  ...createProjects("Interior Design", interiorModules, "image"),
  ...createProjects("Videos", videoThumbModules, "video"),
];

const FILTERS: Array<"All" | ProjectCategory> = ["All", "House Design", "Construction", "Interior Design", "Videos"];

function guessProjectType(fileUrl: string, fallbackType: "image" | "video"): "image" | "video" {
  const lower = fileUrl.toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")) {
    return "video";
  }
  return fallbackType;
}

function ProjectLightbox({
  project,
  onClose,
}: {
  project: MediaProject;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(2,6,23,0.88)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl rounded-[2rem] overflow-hidden"
        style={{ backgroundColor: "#09111F", border: "1px solid rgba(251,191,36,0.16)", boxShadow: "0 40px 120px rgba(0,0,0,0.45)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(15,23,42,0.85)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <X size={18} />
        </button>

        <div className="relative" style={{ maxHeight: "85vh", backgroundColor: "#020617" }}>
          {project.type === "image" ? (
            <ImageWithFallback
              src={project.media}
              alt={CATEGORY_CONFIG[project.category].badge}
              className="w-full"
              style={{ maxHeight: "85vh", objectFit: "contain", backgroundColor: "#020617" }}
            />
          ) : (
            <video
              src={project.media}
              controls
              autoPlay
              className="w-full"
              style={{ maxHeight: "85vh", objectFit: "contain", backgroundColor: "#020617" }}
            />
          )}

          <div
            className="absolute left-4 bottom-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(15,23,42,0.82)", color: "#FBBF24", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 700 }}
          >
            {CATEGORY_CONFIG[project.category].badge}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadedProjects, setLoadedProjects] = useState<Record<string, MediaProject>>({});
  const [selectedProject, setSelectedProject] = useState<MediaProject | null>(null);
  const [remoteProjects, setRemoteProjects] = useState<MediaProjectEntry[]>([]);

  const filteredProjects = useMemo(() => {
    const merged = [...remoteProjects, ...PROJECTS];
    if (activeFilter === "All") return merged;
    return merged.filter((project) => project.category === activeFilter);
  }, [activeFilter, remoteProjects]);

  const visibleProjects = useMemo(
    () => filteredProjects.slice(0, visibleCount),
    [filteredProjects, visibleCount]
  );

  const readyProjects = useMemo(
    () => visibleProjects.map((project) => loadedProjects[project.id]).filter(Boolean),
    [visibleProjects, loadedProjects]
  );

  useEffect(() => {
    setVisibleCount(12);
  }, [activeFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadRemoteProjects() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload.ok === false || !Array.isArray(payload.items)) {
          return;
        }

        const entries: MediaProjectEntry[] = payload.items
          .filter((item: BackendProject) => item && item.url && item.category && item.type)
          .map((item: BackendProject) => ({
            id: `remote-${item.id}`,
            category: item.category,
            type: guessProjectType(item.url, item.type === "video" ? "video" : "image"),
            load: async () => item.url,
          }));

        if (!cancelled) {
          setRemoteProjects(entries);
        }
      } catch {
        // Keep the local gallery working if the backend is offline.
      }
    }

    loadRemoteProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVisibleProjects() {
      const pending = visibleProjects.filter((project) => !loadedProjects[project.id]);
      if (pending.length === 0) return;

      const results = await Promise.all(
        pending.map(async (project) => ({
          id: project.id,
          category: project.category,
          type: project.type,
          media: await project.load(),
        }))
      );

      if (cancelled) return;

      setLoadedProjects((current) => {
        const next = { ...current };
        for (const project of results) {
          next[project.id] = project;
        }
        return next;
      });
    }

    loadVisibleProjects();

    return () => {
      cancelled = true;
    };
  }, [visibleProjects, loadedProjects]);

  return (
    <div style={{ backgroundColor: "#F8F3EA" }}>
      <div
        className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ background: "linear-gradient(to bottom, #F8F3EA, #F2ECE1)" }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(184,138,82,0.14) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto text-center relative">
          <div style={{ color: "#B88A52", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "0.75rem" }}>
            Our Work
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#1F2933", lineHeight: 1.08, marginBottom: "1rem" }}>
            House Design, <span style={{ color: "#B88A52" }}>Construction</span> and Videos
          </h1>
          <p style={{ color: "#5E6770", fontFamily: "'Inter', sans-serif", fontSize: "1.02rem", maxWidth: "42rem", margin: "0 auto", lineHeight: 1.75 }}>
            Check our house design work, construction progress, interior design finishes, and project videos to explore the style, quality, and execution of BL Construction and Design.
          </p>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-5 py-2.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: activeFilter === filter ? "#B88A52" : "#FFFDF9",
                  color: activeFilter === filter ? "#FFFDF9" : "#334155",
                  border: activeFilter === filter ? "none" : "1px solid rgba(92,71,43,0.08)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
            style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(92,71,43,0.08)", boxShadow: "0 18px 45px rgba(31,41,51,0.08)" }}
          >
            <div>
              <div style={{ color: "#B88A52", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.55rem" }}>
                Project Showcase
              </div>
              <h2 style={{ color: "#1F2933", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", marginBottom: "0.45rem" }}>
                Residential work presented in one clean gallery
              </h2>
              <p style={{ color: "#5E6770", fontFamily: "'Inter', sans-serif", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "42rem" }}>
                Browse house designs, construction progress, interior design work, and videos in a visual layout. Click any item to open it in a larger preview.
              </p>
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ backgroundColor: "#F8F3EA", border: "1px solid rgba(92,71,43,0.08)", color: "#334155", fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", fontWeight: 600 }}
            >
              {filteredProjects.length} item{filteredProjects.length === 1 ? "" : "s"} in this view
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div
              className="rounded-3xl p-10 sm:p-14 text-center"
              style={{ backgroundColor: "#FFFDF9", border: "1px dashed rgba(184,138,82,0.25)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ backgroundColor: "rgba(184,138,82,0.1)", color: "#B88A52" }}
              >
                <FolderOpen size={28} />
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#1F2933", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                Add project files to see them here
              </h2>
              <p style={{ color: "#5E6770", fontFamily: "'Inter', sans-serif", lineHeight: 1.75, maxWidth: "42rem", margin: "0 auto" }}>
                Put your files into `src/assets/photos/house-design`, `src/assets/photos/builders`, `src/assets/photos/interior-design`, or `src/assets/photos/videos`. After that, the page will show them automatically with the correct size and section.
              </p>
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 xl:columns-3 gap-6 [column-fill:_balance]">
              {readyProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="mb-6 break-inside-avoid overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                  style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(92,71,43,0.08)", boxShadow: "0 16px 36px rgba(31,41,51,0.08)" }}
                  onClick={() => setSelectedProject(project)}
                >
                  <div
                    className="relative overflow-hidden"
                      style={{ backgroundColor: "#EDE5D8", height: index % 3 === 0 ? "420px" : index % 3 === 1 ? "320px" : "360px" }}
                  >
                    {project.type === "image" ? (
                      <ImageWithFallback
                        src={project.media}
                        alt={project.category}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <video
                          src={project.media}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(15,23,42,0.18)" }}>
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgba(184,138,82,0.94)", boxShadow: "0 0 30px rgba(184,138,82,0.2)" }}
                          >
                            <Play size={20} color="#FFFDF9" fill="#FFFDF9" />
                          </div>
                        </div>
                      </>
                    )}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(31,41,51,0.76) 0%, rgba(31,41,51,0.08) 55%, transparent 100%)" }}
                    />
                    <div
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: "rgba(255,253,249,0.92)", color: "#B88A52", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}
                    >
                      {CATEGORY_CONFIG[project.category].badge}
                    </div>
                    <div
                      className="absolute left-0 right-0 bottom-0 p-5"
                      style={{ color: "#E2E8F0", fontFamily: "'Inter', sans-serif", fontSize: "0.84rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}
                    >
                      <span>BL Construction and Design</span>
                      <span style={{ color: "#E7D5BA", fontWeight: 700 }}>Open</span>
                    </div>
                  </div>
                </article>
              ))}
              </div>

              {visibleCount < filteredProjects.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + 12)}
                    className="px-6 py-3 rounded-xl transition-all hover:scale-105"
                    style={{
                      backgroundColor: "#B88A52",
                      color: "#FFFDF9",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 12px 30px rgba(184,138,82,0.18)",
                    }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedProject && (
        <ProjectLightbox
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
