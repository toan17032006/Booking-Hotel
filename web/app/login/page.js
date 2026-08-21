"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";
import { saveAuth } from "@/lib/auth";
import { authJson } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await authJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!ok) {
        setError(data?.message || "Sai email hoặc mật khẩu");
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
            <LogIn size={22} strokeWidth={2.2} />
          </span>
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Đăng nhập để tiếp tục đặt phòng.</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} strokeWidth={2.2} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <div className="auth-input-wrap">
              <Mail size={16} strokeWidth={2} className="auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            className="button-primary button-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <p className="auth-foot">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="auth-link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
