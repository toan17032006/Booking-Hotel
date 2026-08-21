"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Hotel,
  Home,
  CalendarCheck,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { getUser, clearAuth } from "@/lib/auth";

const links = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/bookings", label: "Phiếu đặt", icon: CalendarCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
    const sync = () => setUser(getUser());
    window.addEventListener("storage", sync);
    window.addEventListener("authchange", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("authchange", sync);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    window.dispatchEvent(new Event("authchange"));
    router.push("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="brand-icon" aria-hidden="true">
            <Hotel size={20} strokeWidth={2.4} />
          </span>
          HotelBooking
        </Link>
        <nav className="navbar-nav">
          <ul className="navbar-links">
            {links.map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`nav-link${active ? " active" : ""}`}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <span className="nav-label">{l.label}</span>
                  </Link>
                </li>
              );
            })}
            {user && user.role === "ADMIN" && (
              <li>
                <Link
                  href="/admin"
                  className={`nav-link nav-link-admin${
                    pathname === "/admin" ? " active" : ""
                  }`}
                >
                  <span className="nav-icon" aria-hidden="true">
                    <ShieldCheck size={16} strokeWidth={2.2} />
                  </span>
                  <span className="nav-label">Quản trị</span>
                </Link>
              </li>
            )}
          </ul>

          <div className="navbar-auth">
            {user ? (
              <>
                <span className="nav-user" title={user.email || ""}>
                  <span className="nav-user-icon" aria-hidden="true">
                    <UserCircle2 size={16} strokeWidth={2.2} />
                  </span>
                  <span className="nav-user-name">{user.name || user.email}</span>
                </span>
                <button
                  type="button"
                  className="nav-button nav-button-ghost"
                  onClick={handleLogout}
                >
                  <LogOut size={16} strokeWidth={2.2} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-button nav-button-ghost">
                  <LogIn size={16} strokeWidth={2.2} />
                  <span>Đăng nhập</span>
                </Link>
                <Link href="/register" className="nav-button nav-button-primary">
                  <UserPlus size={16} strokeWidth={2.2} />
                  <span>Đăng ký</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
