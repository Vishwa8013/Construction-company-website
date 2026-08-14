import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Video,
} from "lucide-react";

type ProjectCategory = "House Design" | "Construction" | "Interior Design" | "Videos";
type ProjectType = "image" | "video" | "document";
type UserRole = "admin" | "member";
type AdminSection = "dashboard" | "upload" | "manager" | "members";

type AdminProject = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  type: ProjectType;
  url: string;
  originalName: string;
  size: number;
  createdAt: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") || "https://construction-company-website-9y9x.onrender.com";
const AUTH_TOKEN_KEY = "bl-admin-token";
const CATEGORY_OPTIONS: ProjectCategory[] = ["House Design", "Construction", "Interior Design", "Videos"];
const SECTION_ITEMS: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "manager", label: "Manager", icon: FolderKanban },
  { id: "members", label: "Manage Members", icon: Users },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeIcon(type: ProjectType) {
  if (type === "video") return <Video size={18} />;
  if (type === "document") return <FileText size={18} />;
  return <ImageIcon size={18} />;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: "#F8F3EA", border: "1px solid rgba(92,71,43,0.08)" }}>
      <div style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: "0.35rem" }}>{label}</div>
      <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#1F2933" }}>{value}</div>
    </div>
  );
}

export function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [token, setToken] = useState<string>(() => localStorage.getItem(AUTH_TOKEN_KEY) || "");
  const [me, setMe] = useState<AdminUser | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("House Design");
  const [file, setFile] = useState<File | null>(null);

  const [projectFilter, setProjectFilter] = useState<"All" | ProjectCategory>("All");
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<ProjectCategory>("House Design");

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberRole, setMemberRole] = useState<UserRole>("member");

  const [editingMemberId, setEditingMemberId] = useState("");
  const [editingMemberName, setEditingMemberName] = useState("");
  const [editingMemberEmail, setEditingMemberEmail] = useState("");
  const [editingMemberPassword, setEditingMemberPassword] = useState("");
  const [editingMemberRole, setEditingMemberRole] = useState<UserRole>("member");

  const isAdmin = me?.role === "admin";
  const panelRiseStyle = {
    animation: "bl-panel-rise 0.7s ease-out both",
  } as const;

  async function apiFetch(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.ok === false) {
      throw new Error(payload.message || "Request failed");
    }

    return payload;
  }

  async function loadProjects() {
    const payload = await apiFetch("/api/projects");
    setProjects(payload.items || []);
  }

  async function loadMembers() {
    if (!isAdmin) {
      setMembers([]);
      return;
    }

    const payload = await apiFetch("/api/users");
    setMembers(payload.items || []);
  }

  async function loadSession() {
    if (!token) {
      setMe(null);
      setProjects([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const session = await apiFetch("/api/auth/me");
      setMe(session.user);

      const projectsPayload = await apiFetch("/api/projects");
      setProjects(projectsPayload.items || []);

      if (session.user.role === "admin") {
        const usersPayload = await apiFetch("/api/users");
        setMembers(usersPayload.items || []);
      } else {
        setMembers([]);
      }
    } catch (sessionError) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken("");
      setMe(null);
      setMembers([]);
      setProjects([]);
      setError(sessionError instanceof Error ? sessionError.message : "Session expired");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, [token]);

  useEffect(() => {
    if (activeSection === "members" && isAdmin && token) {
      loadMembers().catch((membersError) => {
        setError(membersError instanceof Error ? membersError.message : "Could not load members");
      });
    }
  }, [activeSection, isAdmin, token]);

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken("");
    setMe(null);
    setActiveSection("dashboard");
    setSuccess("");
    setError("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      resetMessages();
      setAuthLoading(true);
      const payload = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
          throw new Error(data.message || "Login failed");
        }
        return data;
      });

      localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
      setToken(payload.token);
      setLoginPassword("");
      setSuccess("Login successful.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    try {
      resetMessages();
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("file", file);

      const payload = await apiFetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      setProjects((current) => [payload.item, ...current]);
      setTitle("");
      setDescription("");
      setCategory("House Design");
      setFile(null);
      const fileInput = document.getElementById("project-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setSuccess("Project uploaded successfully.");
      setActiveSection("manager");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  function beginProjectEdit(project: AdminProject) {
    setEditingProjectId(project.id);
    setEditTitle(project.title || "");
    setEditDescription(project.description || "");
    setEditCategory(project.category);
  }

  async function saveProjectEdit(projectId: string) {
    try {
      resetMessages();
      const payload = await apiFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
        }),
      });

      setProjects((current) => current.map((project) => (project.id === projectId ? payload.item : project)));
      setEditingProjectId("");
      setSuccess("Project details updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed");
    }
  }

  async function handleDeleteProject(id: string) {
    if (!window.confirm("Delete this project item?")) return;

    try {
      resetMessages();
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((current) => current.filter((project) => project.id !== id));
      setSuccess("Project deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  async function handleCreateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      resetMessages();
      const payload = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: memberName,
          email: memberEmail,
          password: memberPassword,
          role: memberRole,
        }),
      });

      setMembers((current) => [...current, payload.item]);
      setMemberName("");
      setMemberEmail("");
      setMemberPassword("");
      setMemberRole("member");
      setSuccess("Member created.");
    } catch (memberError) {
      setError(memberError instanceof Error ? memberError.message : "Could not create member");
    }
  }

  function beginMemberEdit(member: AdminUser) {
    setEditingMemberId(member.id);
    setEditingMemberName(member.name);
    setEditingMemberEmail(member.email);
    setEditingMemberPassword("");
    setEditingMemberRole(member.role);
  }

  async function saveMemberEdit(memberId: string) {
    try {
      resetMessages();
      const payload = await apiFetch(`/api/users/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingMemberName,
          email: editingMemberEmail,
          password: editingMemberPassword || undefined,
          role: editingMemberRole,
        }),
      });

      setMembers((current) => current.map((member) => (member.id === memberId ? payload.item : member)));
      if (me?.id === memberId) {
        setMe(payload.item);
      }
      setEditingMemberId("");
      setSuccess("Member updated.");
    } catch (memberError) {
      setError(memberError instanceof Error ? memberError.message : "Could not update member");
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (!window.confirm("Delete this member account?")) return;

    try {
      resetMessages();
      await apiFetch(`/api/users/${memberId}`, { method: "DELETE" });
      setMembers((current) => current.filter((member) => member.id !== memberId));
      setSuccess("Member deleted.");
    } catch (memberError) {
      setError(memberError instanceof Error ? memberError.message : "Could not delete member");
    }
  }

  const filteredProjects =
    projectFilter === "All" ? projects : projects.filter((project) => project.category === projectFilter);

  if (!token || !me) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f6f1e8 0%, #efe7da 100%)",
          color: "#1F2933",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8"
            style={{ color: "#8B5E34", fontWeight: 600, textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            Back to website
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
            <div
              className="rounded-[2rem] p-8 sm:p-10"
              style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(92,71,43,0.08)", boxShadow: "0 22px 55px rgba(31,41,51,0.08)" }}
            >
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4" style={{ backgroundColor: "#F5EEE2", color: "#8B5E34", fontSize: "0.78rem", fontWeight: 700 }}>
                  <ShieldCheck size={14} />
                  Admin Access
                </div>
                <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.08, marginBottom: "0.85rem" }}>
                  Admin Login
                </h1>
                <p style={{ color: "#5E6770", lineHeight: 1.8, maxWidth: "34rem", marginBottom: "1.6rem" }}>
                  Sign in to manage uploads and members.
                </p>
            </div>

            <div
              className="rounded-[2rem] p-8"
              style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(92,71,43,0.08)", boxShadow: "0 22px 55px rgba(31,41,51,0.08)" }}
            >
              <div style={{ color: "#8B5E34", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.65rem" }}>
                Sign In
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.8rem", marginBottom: "0.85rem" }}>
                Admin Login
              </h2>

              {(error || success) && (
                <div
                  className="rounded-2xl px-4 py-3 mb-4"
                  style={{
                    backgroundColor: error ? "rgba(127,29,29,0.08)" : "rgba(22,101,52,0.08)",
                    color: error ? "#991B1B" : "#166534",
                    border: error ? "1px solid rgba(127,29,29,0.14)" : "1px solid rgba(22,101,52,0.14)",
                  }}
                >
                  {error || success}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block mb-2" style={{ fontWeight: 600 }}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="Email"
                    className="w-full rounded-2xl px-4 py-3 outline-none"
                    style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block mb-2" style={{ fontWeight: 600 }}>
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="Password"
                    className="w-full rounded-2xl px-4 py-3 outline-none"
                    style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3"
                  style={{
                    backgroundColor: authLoading ? "#D1B894" : "#8B5E34",
                    color: "#FFFDF9",
                    fontWeight: 700,
                    border: "none",
                    cursor: authLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <ShieldCheck size={18} />
                  {authLoading ? "Signing in..." : "Login"}
                </button>
              </form>
                </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f6f1e8 0%, #efe7da 100%)",
        color: "#1F2933",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{adminStyles}</style>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6 xl:items-center">
          <aside
            className="rounded-[2rem] p-6 h-fit xl:sticky xl:top-1/2 xl:-translate-y-1/2"
            style={{
              backgroundColor: "#FFFDF9",
              border: "1px solid rgba(92,71,43,0.08)",
              boxShadow: "0 22px 55px rgba(31,41,51,0.08)",
              ...panelRiseStyle,
            }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-6"
              style={{ color: "#8B5E34", fontWeight: 600, textDecoration: "none" }}
            >
              <ArrowLeft size={16} />
              Back to website
            </Link>

            <div style={{ color: "#8B5E34", fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.55rem" }}>
              Admin Workspace
            </div>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "1.8rem", lineHeight: 1.1, marginBottom: "0.8rem" }}>
              BL Backend UI
            </h1>
            <div
              className="rounded-2xl p-4 mb-6"
              style={{ backgroundColor: "#F8F3EA", border: "1px solid rgba(92,71,43,0.08)" }}
            >
              <div style={{ fontWeight: 700, color: "#1F2933", marginBottom: "0.25rem" }}>{me.name}</div>
              <div style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: "0.45rem" }}>{me.email}</div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: "#FFFDF9", color: "#8B5E34", fontWeight: 700, fontSize: "0.78rem" }}>
                <ShieldCheck size={15} />
                {me.role === "admin" ? "Admin" : "Member"}
              </div>
            </div>

            <nav className="space-y-2 mb-6">
              {SECTION_ITEMS.filter((item) => (item.id === "members" ? isAdmin : true)).map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
                    style={{
                      backgroundColor: active ? "#8B5E34" : "#FFFDF9",
                      color: active ? "#FFFDF9" : "#334155",
                      border: active ? "none" : "1px solid rgba(92,71,43,0.08)",
                      fontWeight: 700,
                      transform: active ? "translateX(6px)" : "translateX(0)",
                      transition: "transform 180ms ease, background-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
                      boxShadow: active ? "0 12px 28px rgba(139,94,52,0.22)" : "none",
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3"
              style={{ backgroundColor: "#7F1D1D", color: "#FFFDF9", fontWeight: 700, border: "none" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          <section
            className="rounded-[2rem] p-6 sm:p-8"
            style={{
              backgroundColor: "#FFFDF9",
              border: "1px solid rgba(92,71,43,0.08)",
              boxShadow: "0 22px 55px rgba(31,41,51,0.08)",
              ...panelRiseStyle,
              animationDelay: "90ms",
            }}
          >
            {(error || success) && (
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={{
                  backgroundColor: error ? "rgba(127,29,29,0.08)" : "rgba(22,101,52,0.08)",
                  color: error ? "#991B1B" : "#166534",
                  border: error ? "1px solid rgba(127,29,29,0.14)" : "1px solid rgba(22,101,52,0.14)",
                }}
              >
                {error || success}
              </div>
            )}

            {loading ? (
              <div style={{ color: "#64748B" }}>Loading admin workspace...</div>
            ) : (
              <>
                {activeSection === "dashboard" && (
                  <div>
                    <div style={{ color: "#8B5E34", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.65rem" }}>
                      Dashboard
                    </div>
                    <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "2.2rem", marginBottom: "0.75rem" }}>
                      Project overview
                    </h2>
                    <p style={{ color: "#5E6770", lineHeight: 1.8, marginBottom: "1.75rem" }}>
                      This dashboard gives you a quick view of the backend content library, category split, and who currently has access to manage the system.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                      <StatCard label="Total projects" value={projects.length} />
                      <StatCard label="Team members" value={isAdmin ? members.length : 1} />
                      <StatCard label="Videos / PDFs" value={projects.filter((item) => item.type !== "image").length} />
                      <StatCard label="Role" value={me.role === "admin" ? "Admin" : "Member"} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {CATEGORY_OPTIONS.map((item) => (
                        <div key={item} className="rounded-3xl p-5" style={{ backgroundColor: "#F8F3EA", border: "1px solid rgba(92,71,43,0.08)" }}>
                          <div style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: "0.35rem" }}>{item}</div>
                          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1F2933" }}>
                            {projects.filter((project) => project.category === item).length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "upload" && (
                  <div>
                    <div style={{ color: "#8B5E34", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.65rem" }}>
                      Upload
                    </div>
                    <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "2.2rem", marginBottom: "0.75rem" }}>
                      Upload new project media
                    </h2>
                    <p style={{ color: "#5E6770", lineHeight: 1.8, marginBottom: "1.75rem", maxWidth: "48rem" }}>
                      Add a new image, video, or PDF to the backend catalog. Once we connect the public projects page to this API, uploads from here will appear on the website automatically.
                    </p>

                    <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="project-title" className="block mb-2" style={{ fontWeight: 600 }}>Title</label>
                        <input
                          id="project-title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Front elevation, staircase work, walkthrough video..."
                          className="w-full rounded-2xl px-4 py-3 outline-none"
                          style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                        />
                      </div>
                      <div>
                        <label htmlFor="project-category" className="block mb-2" style={{ fontWeight: 600 }}>Category</label>
                        <select
                          id="project-category"
                          value={category}
                          onChange={(event) => setCategory(event.target.value as ProjectCategory)}
                          className="w-full rounded-2xl px-4 py-3 outline-none"
                          style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label htmlFor="project-description" className="block mb-2" style={{ fontWeight: 600 }}>Description</label>
                        <textarea
                          id="project-description"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          rows={4}
                          placeholder="Optional short note about this file"
                          className="w-full rounded-2xl px-4 py-3 outline-none resize-none"
                          style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label htmlFor="project-file" className="block mb-2" style={{ fontWeight: 600 }}>File</label>
                        <input
                          id="project-file"
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm,.pdf"
                          onChange={(event) => setFile(event.target.files?.[0] || null)}
                          className="w-full rounded-2xl px-4 py-3 outline-none"
                          style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3"
                          style={{
                            backgroundColor: saving ? "#D1B894" : "#8B5E34",
                            color: "#FFFDF9",
                            fontWeight: 700,
                            border: "none",
                            cursor: saving ? "not-allowed" : "pointer",
                          }}
                        >
                          <Upload size={18} />
                          {saving ? "Uploading..." : "Upload Project"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === "manager" && (
                  <div>
                    <div style={{ color: "#8B5E34", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.65rem" }}>
                      Manager
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                      <div>
                        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "2.2rem", marginBottom: "0.55rem" }}>
                          Manage project library
                        </h2>
                        <p style={{ color: "#5E6770", lineHeight: 1.8 }}>
                          Projects are separated into the four main topics. You can rename items, change category, update descriptions, and delete files from here.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadProjects().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not refresh projects"))}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3"
                        style={{ backgroundColor: "#F5EEE2", color: "#8B5E34", fontWeight: 700, border: "1px solid rgba(92,71,43,0.08)" }}
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-6">
                      {["All", ...CATEGORY_OPTIONS].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setProjectFilter(option as "All" | ProjectCategory)}
                          className="rounded-full px-4 py-2"
                          style={{
                            backgroundColor: projectFilter === option ? "#8B5E34" : "#FFFDF9",
                            color: projectFilter === option ? "#FFFDF9" : "#334155",
                            border: projectFilter === option ? "none" : "1px solid rgba(92,71,43,0.08)",
                            fontWeight: 700,
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {filteredProjects.map((project) => (
                        <article key={project.id} className="rounded-3xl p-5" style={{ backgroundColor: "#F8F3EA", border: "1px solid rgba(92,71,43,0.08)" }}>
                          {editingProjectId === project.id ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <label className="block mb-2" style={{ fontWeight: 600 }}>Title</label>
                                <input
                                  value={editTitle}
                                  onChange={(event) => setEditTitle(event.target.value)}
                                  className="w-full rounded-2xl px-4 py-3 outline-none"
                                  style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                                />
                              </div>
                              <div>
                                <label className="block mb-2" style={{ fontWeight: 600 }}>Category</label>
                                <select
                                  value={editCategory}
                                  onChange={(event) => setEditCategory(event.target.value as ProjectCategory)}
                                  className="w-full rounded-2xl px-4 py-3 outline-none"
                                  style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                                >
                                  {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="lg:col-span-2">
                                <label className="block mb-2" style={{ fontWeight: 600 }}>Description</label>
                                <textarea
                                  value={editDescription}
                                  onChange={(event) => setEditDescription(event.target.value)}
                                  rows={3}
                                  className="w-full rounded-2xl px-4 py-3 outline-none resize-none"
                                  style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                                />
                              </div>
                              <div className="lg:col-span-2 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() => saveProjectEdit(project.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#8B5E34", color: "#FFFDF9", fontWeight: 700, border: "none" }}
                                >
                                  <Save size={16} />
                                  Save changes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProjectId("")}
                                  className="rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#FFFDF9", color: "#334155", fontWeight: 700, border: "1px solid rgba(92,71,43,0.08)" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: "#FFFDF9", color: "#8B5E34", fontWeight: 700, fontSize: "0.78rem" }}>
                                    {getTypeIcon(project.type)}
                                    {project.category}
                                  </span>
                                  <span style={{ color: "#64748B", fontSize: "0.84rem" }}>{formatFileSize(project.size)}</span>
                                </div>
                                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.18rem", marginBottom: "0.45rem" }}>
                                  {project.title || project.originalName}
                                </h3>
                                {project.description && (
                                  <p style={{ color: "#5E6770", lineHeight: 1.7, marginBottom: "0.65rem" }}>{project.description}</p>
                                )}
                                <div style={{ color: "#64748B", fontSize: "0.86rem", lineHeight: 1.7 }}>
                                  <div>Original file: {project.originalName}</div>
                                  <div>Added: {new Date(project.createdAt).toLocaleString()}</div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#FFFDF9", color: "#8B5E34", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(92,71,43,0.08)" }}
                                >
                                  <ExternalLink size={16} />
                                  Open
                                </a>
                                <button
                                  type="button"
                                  onClick={() => beginProjectEdit(project)}
                                  className="rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#F5EEE2", color: "#8B5E34", fontWeight: 700, border: "1px solid rgba(92,71,43,0.08)" }}
                                >
                                  Rename / Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#7F1D1D", color: "#FFFDF9", fontWeight: 700, border: "none" }}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "members" && isAdmin && (
                  <div>
                    <div style={{ color: "#8B5E34", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.65rem" }}>
                      Manage Members
                    </div>
                    <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "2.2rem", marginBottom: "0.75rem" }}>
                      Team authorization
                    </h2>
                    <p style={{ color: "#5E6770", lineHeight: 1.8, marginBottom: "1.75rem" }}>
                      Admin users can create and manage member accounts. Members can use the admin panel, while admins control team permissions and access.
                    </p>

                    <form onSubmit={handleCreateMember} className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                      <input
                        value={memberName}
                        onChange={(event) => setMemberName(event.target.value)}
                        placeholder="Member name"
                        className="rounded-2xl px-4 py-3 outline-none"
                        style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                      />
                      <input
                        value={memberEmail}
                        onChange={(event) => setMemberEmail(event.target.value)}
                        placeholder="Email"
                        type="email"
                        className="rounded-2xl px-4 py-3 outline-none"
                        style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                      />
                      <input
                        value={memberPassword}
                        onChange={(event) => setMemberPassword(event.target.value)}
                        placeholder="Password"
                        type="password"
                        className="rounded-2xl px-4 py-3 outline-none"
                        style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                      />
                      <div className="flex gap-3">
                        <select
                          value={memberRole}
                          onChange={(event) => setMemberRole(event.target.value as UserRole)}
                          className="flex-1 rounded-2xl px-4 py-3 outline-none"
                          style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-2xl px-4 py-3"
                          style={{ backgroundColor: "#8B5E34", color: "#FFFDF9", fontWeight: 700, border: "none" }}
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    <div className="space-y-4">
                      {members.map((member) => (
                        <article key={member.id} className="rounded-3xl p-5" style={{ backgroundColor: "#F8F3EA", border: "1px solid rgba(92,71,43,0.08)" }}>
                          {editingMemberId === member.id ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <input
                                value={editingMemberName}
                                onChange={(event) => setEditingMemberName(event.target.value)}
                                className="rounded-2xl px-4 py-3 outline-none"
                                style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                              />
                              <input
                                value={editingMemberEmail}
                                onChange={(event) => setEditingMemberEmail(event.target.value)}
                                type="email"
                                className="rounded-2xl px-4 py-3 outline-none"
                                style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                              />
                              <input
                                value={editingMemberPassword}
                                onChange={(event) => setEditingMemberPassword(event.target.value)}
                                type="password"
                                placeholder="New password (optional)"
                                className="rounded-2xl px-4 py-3 outline-none"
                                style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                              />
                              <select
                                value={editingMemberRole}
                                onChange={(event) => setEditingMemberRole(event.target.value as UserRole)}
                                className="rounded-2xl px-4 py-3 outline-none"
                                style={{ border: "1px solid rgba(92,71,43,0.12)", backgroundColor: "#FFFEFC" }}
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                              <div className="lg:col-span-2 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() => saveMemberEdit(member.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#8B5E34", color: "#FFFDF9", fontWeight: 700, border: "none" }}
                                >
                                  <Save size={16} />
                                  Save member
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingMemberId("")}
                                  className="rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#FFFDF9", color: "#334155", fontWeight: 700, border: "1px solid rgba(92,71,43,0.08)" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div style={{ fontWeight: 700, color: "#1F2933", marginBottom: "0.35rem" }}>{member.name}</div>
                                <div style={{ color: "#5E6770", marginBottom: "0.55rem" }}>{member.email}</div>
                                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: "#FFFDF9", color: "#8B5E34", fontWeight: 700, fontSize: "0.78rem" }}>
                                  <ShieldCheck size={15} />
                                  {member.role}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() => beginMemberEdit(member)}
                                  className="rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#F5EEE2", color: "#8B5E34", fontWeight: 700, border: "1px solid rgba(92,71,43,0.08)" }}
                                >
                                  Edit member
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3"
                                  style={{ backgroundColor: "#7F1D1D", color: "#FFFDF9", fontWeight: 700, border: "none" }}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const adminStyles = `
@keyframes bl-panel-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
