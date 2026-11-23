import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Crown,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FloppyDisk,
  IdentificationBadge,
  LockKey,
  ShieldCheck,
  SignOut,
  UserCircle,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import api from "../../api";

function formatDateVi(raw) {
  if (!raw) return "—";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return String(raw);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    current_password: "",
    password: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [notice, setNotice] = useState({ type: "", text: "" });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/profile");
      const data = response.data?.data || response.data;
      setUser(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        current_password: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "Không thể tải thông tin hồ sơ quản trị viên.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const syncStoredUser = (updated) => {
    const syncStorage = (storage) => {
      try {
        const raw = storage.getItem("user");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        storage.setItem(
          "user",
          JSON.stringify({ ...parsed, name: updated.name, email: updated.email })
        );
      } catch {
        // ignore
      }
    };
    syncStorage(localStorage);
    syncStorage(sessionStorage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: "", text: "" });

    if (formData.password) {
      if (!formData.current_password) {
        setNotice({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại để xác nhận đổi mật khẩu." });
        return;
      }
      if (formData.password.length < 6) {
        setNotice({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setNotice({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp." });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (formData.password) {
        payload.current_password = formData.current_password;
        payload.password = formData.password;
      }

      const res = await api.put("/admin/profile", payload);
      const updatedUser = res.data?.data || res.data;

      setUser(updatedUser);
      syncStoredUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name || prev.name,
        email: updatedUser.email || prev.email,
        current_password: "",
        password: "",
        confirmPassword: "",
      }));
      setNotice({
        type: "success",
        text: res.data?.message || "Đã cập nhật hồ sơ quản trị viên thành công.",
      });
    } catch (err) {
      const msg =
        Object.values(err.response?.data?.errors || {}).flat()[0] ||
        err.response?.data?.message ||
        "Không thể cập nhật hồ sơ. Vui lòng thử lại.";
      setNotice({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const roleName = user?.role || user?.roles?.[0]?.name || "admin";
  const tierName = user?.membership_tier || "Standard";
  const initials = (user?.name || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <div style={{ maxWidth: "1520px", margin: "0 auto", padding: "4px 0 16px 0" }}>
      {/* 1. HEADER ROW */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-white/95 text-blue-600 shadow-sm"
            style={{ borderRadius: 14, border: "1px solid #d5e6fc" }}
          >
            <UserCircle size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Hồ sơ Quản trị viên (Profile)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Quản lý thông tin định danh, mật khẩu bảo mật và phiên đăng nhập SkyLink Admin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex w-fit cursor-pointer items-center gap-2 bg-white/95 font-extrabold text-rose-600 shadow-sm transition hover:bg-rose-50"
          style={{
            borderRadius: 9999,
            border: "1px solid #fecaca",
            padding: "9px 18px",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          <SignOut size={16} weight="bold" />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {notice.text && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold ${
            notice.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
          style={{ fontSize: 13 }}
        >
          <span className="inline-flex items-center gap-2">
            {notice.type === "error" ? (
              <WarningCircle size={17} weight="fill" />
            ) : (
              <CheckCircle size={17} weight="fill" />
            )}
            {notice.text}
          </span>
          <button
            type="button"
            onClick={() => setNotice({ type: "", text: "" })}
            className="cursor-pointer bg-transparent p-1 text-current opacity-70 hover:opacity-100"
            style={{ border: "none" }}
          >
            <X size={15} weight="bold" />
          </button>
        </div>
      )}

      {/* 2. IDENTITY BANNER CARD */}
      <div
        className="relative mb-5 overflow-hidden p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #092c7a 0%, #0b5ed7 55%, #1d75f2 100%)",
          borderRadius: 24,
          boxShadow: "0 14px 34px rgba(11, 94, 215, 0.22)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-8 opacity-10"
        >
          <ShieldCheck size={200} weight="duotone" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center font-black text-white shadow-lg"
            style={{
              borderRadius: 9999,
              background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
              border: "3px solid rgba(255,255,255,0.45)",
              fontSize: 28,
            }}
          >
            {loading ? "..." : initials || "A"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-black text-white" style={{ margin: 0, fontSize: 23 }}>
                {loading ? "Đang tải..." : user?.name || "Quản trị viên"}
              </h2>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 font-extrabold uppercase"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: 9999,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                }}
              >
                <ShieldCheck size={14} weight="fill" />
                {roleName === "admin" ? "Quản trị viên" : roleName}
              </span>
            </div>

            <div
              className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold text-blue-100"
              style={{ fontSize: 13.5 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <EnvelopeSimple size={15} weight="duotone" />
                {user?.email || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Crown size={15} weight="fill" className="text-amber-300" />
                Hạng {tierName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IdentificationBadge size={15} weight="duotone" />
                Mã TK #{user?.id || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN 12-COLUMN GRID */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* LEFT: EDIT PROFILE & PASSWORD (8 cols) */}
        <div
          className="bg-white p-6 lg:col-span-8"
          style={{
            borderRadius: 24,
            border: "1px solid #d5e6fc",
            boxShadow: "0 14px 36px rgba(18, 60, 130, 0.08)",
          }}
        >
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3.5">
            <UserCircle size={20} weight="duotone" className="text-blue-600" />
            <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 16 }}>
              Cập nhật thông tin &amp; Bảo mật
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" style={{ fontSize: 13 }}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 6 }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3.5 py-2.5 font-semibold text-[#091e47] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 6 }}>
                  Địa chỉ Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3.5 py-2.5 font-semibold text-[#091e47] outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <LockKey size={18} weight="duotone" className="text-blue-600" />
                <span className="font-extrabold text-[#091e47]" style={{ fontSize: 14 }}>
                  Đổi mật khẩu
                </span>
                <span className="font-medium text-slate-400" style={{ fontSize: 12 }}>
                  (Để trống nếu không muốn thay đổi)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    name: "current_password",
                    label: "Mật khẩu hiện tại",
                    key: "current",
                  },
                  {
                    name: "password",
                    label: "Mật khẩu mới (≥ 6 ký tự)",
                    key: "next",
                  },
                  {
                    name: "confirmPassword",
                    label: "Xác nhận mật khẩu mới",
                    key: "confirm",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 6 }}>
                      {field.label}
                    </label>
                    <div className="flex items-center rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 focus-within:border-blue-400">
                      <input
                        type={showPwd[field.key] ? "text" : "password"}
                        name={field.name}
                        placeholder="••••••••"
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className="w-full bg-transparent font-semibold text-[#091e47] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPwd((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                        }
                        className="cursor-pointer bg-transparent p-1 text-slate-400 hover:text-blue-600"
                        style={{ border: "none" }}
                        aria-label="Hiện/ẩn mật khẩu"
                      >
                        {showPwd[field.key] ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-2 px-6 py-2.5 font-extrabold text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                  fontSize: 13.5,
                  boxShadow: "0 8px 20px rgba(13, 97, 225, 0.25)",
                }}
              >
                <FloppyDisk size={17} weight="bold" />
                <span>{saving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: ACCOUNT OVERVIEW CARD (4 cols) */}
        <div
          className="bg-white p-6 lg:col-span-4"
          style={{
            borderRadius: 24,
            border: "1px solid #d5e6fc",
            boxShadow: "0 14px 36px rgba(18, 60, 130, 0.08)",
          }}
        >
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3.5">
            <ShieldCheck size={20} weight="duotone" className="text-blue-600" />
            <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 16 }}>
              Tổng quan tài khoản
            </h3>
          </div>

          <div className="space-y-3" style={{ fontSize: 13 }}>
            <div className="flex items-center justify-between rounded-2xl bg-[#f4f8ff] px-4 py-3">
              <span className="font-semibold text-[#476494]">Mã tài khoản</span>
              <span className="font-black text-[#091e47]">#{user?.id || "—"}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#f4f8ff] px-4 py-3">
              <span className="font-semibold text-[#476494]">Vai trò hệ thống</span>
              <span
                className="px-2.5 py-0.5 font-extrabold text-[#0b4fd0]"
                style={{
                  background: "#dbeafe",
                  borderRadius: 9999,
                  fontSize: 11.5,
                }}
              >
                {roleName === "admin" ? "QUẢN TRỊ VIÊN" : roleName.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#f4f8ff] px-4 py-3">
              <span className="font-semibold text-[#476494]">Hạng hội viên</span>
              <span
                className="px-2.5 py-0.5 font-extrabold text-amber-700"
                style={{
                  background: "#fef3c7",
                  borderRadius: 9999,
                  fontSize: 11.5,
                }}
              >
                {tierName}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#f4f8ff] px-4 py-3">
              <span className="font-semibold text-[#476494]">Ngày tham gia</span>
              <span className="font-bold text-[#091e47]">{formatDateVi(user?.created_at)}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="font-bold text-emerald-800">Trạng thái</span>
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700" style={{ fontSize: 12 }}>
                <CheckCircle size={15} weight="fill" />
                Đang hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
