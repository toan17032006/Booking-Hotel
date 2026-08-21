import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import Navbar from "./components/Navbar";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Đặt phòng khách sạn",
  description: "Hệ thống đặt phòng khách sạn trực tuyến",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={beVietnamPro.className}>
      <body>
        <Navbar />
        <main className="container">{children}</main>
        <footer className="footer">© 2026 Đặt phòng khách sạn</footer>
      </body>
    </html>
  );
}
