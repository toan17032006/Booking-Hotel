"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  Users,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { saveAuth } from "@/lib/auth";
import { authJson } from "@/lib/api";

const GENDERS = [
  { value: "Nam", label: "Nam" },
  { value: "Nu", label: "Nữ" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "Nam",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Vui lòng điền họ tên, email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await authJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender,
        }),
      });
      if (!ok) {
        setError(data?.message || "Đăng ký thất bại");
        return;
      }
      saveAuth(data);
      router.push("/");
    } catch (err) {
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon" aria-hidden="true">
            <UserPlus size={22} strokeWidth={2.2} />
          </span>
          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">
            Tạo tài khoản để bắt đầu đặt phòng khách sạn.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} strokeWidth={2.2} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Họ và tên
            <div className="auth-input-wrap">
              <User size={16} strokeWidth={2} className="auth-input-icon" />
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                required
              />
            </div>
          </label>

          <label>
            Email
            <div className="auth-input-wrap">
              <Mail size={16} strokeWidth={2} className="auth-input-icon" />
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label>
            Mật khẩu
            <div className="auth-input-wrap">
              <Lock size={16} strokeWidth={2} className="auth-input-icon" />
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                required
              />
            </div>
          </label>

          <div className="auth-row">
            <label>
              Số điện thoại
              <div className="auth-input-wrap">
                <Phone size={16} strokeWidth={2} className="auth-input-icon" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="0901234567"
                  autoComplete="tel"
                />
              </div>
            </label>

            <label>
              Giới tính
              <div className="select-wrap">
                <Users
                  size={16}
                  strokeWidth={2}
                  className="select-icon"
                  aria-hidden="true"
                />
                <select
                  value={form.gender}
                  onChange={update("gender")}
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="button-primary button-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </button>
        </form>

        <p className="auth-foot">
          Đã có tài khoản?{" "}
          <Link href="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
