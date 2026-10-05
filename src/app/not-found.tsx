import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `Page not found, ${site.name}` };

export default function NotFound() {
  return (
    <main className="shell flex min-h-svh flex-col justify-center gap-6">
      <h1 className="type-title max-w-[14ch]">There’s nothing at this address.</h1>
      <p className="type-lead max-w-[40ch] text-ash">
        The link may be old, or the page may have moved. Everything that’s live is on the home page.
      </p>
      <p>
        {/* A plain link: the 404 page is static, and this keeps the base path right on GitHub Pages. */}
        <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`} className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-chalk">
          Go to the home page
        </a>
      </p>
    </main>
  );
}
