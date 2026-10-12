import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import MouseEffect from "@/components/MouseEffect";
import ScrollEffects from "@/components/ScrollEffects";

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "PrepSmart AI | Next-Gen AI Mock Interview Platform",
  description: "Master behavioral and technical interviews with real-time AI feedback and speech analytics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster />
          <MouseEffect />
          <ScrollEffects />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
