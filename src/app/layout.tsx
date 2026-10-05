import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { site } from "@/content/site";
import "./globals.css";

// Mona Sans, self-hosted: one variable file covers weight 200–900 and width 75–125%.
const mona = localFont({
  src: "./fonts/MonaSans-Variable.woff2",
  variable: "--font-mona",
  weight: "200 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 125%" }],
});

export const metadata: Metadata = {
  // Absolute URLs for link previews. The Pages workflow passes the live address in SITE_URL.
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: `${site.name}, ${site.role.toLowerCase()}`,
  description: site.pitch,
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={mona.variable}>
      <body>
        {/* Without JavaScript, show everything that would otherwise animate in. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <Providers>{children}</Providers>
        <div aria-hidden="true" className="grain" />
      </body>
    </html>
  );
}
