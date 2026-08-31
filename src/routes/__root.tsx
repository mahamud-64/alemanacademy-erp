import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { LanguageProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SlidingNewsTicker } from "@/components/SlidingNewsTicker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Al Eman Islamic Academy</p>
        <h1 className="mt-2 text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Try the notice board or the home page.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            Go home
          </Link>
          <Link
            to="/notices"
            className="inline-flex items-center justify-center rounded-full border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            Notice board
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },

      // Primary SEO
      {
        title: "Al Eman Islamic Academy | Chattogram",
      },
      {
        name: "description",
        content:
          "Al Eman Islamic Academy, Chattogram — integrating Islamic and modern education from Play Group to Class X.",
      },
      {
        name: "author",
        content: "Al Eman Islamic Academy",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "googlebot",
        content: "index, follow",
      },

      // Open Graph
      {
        property: "og:site_name",
        content: "Al Eman Islamic Academy",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "Al Eman Islamic Academy | Chattogram",
      },
      {
        property: "og:description",
        content:
          "Al Eman Islamic Academy, Chattogram — integrating Islamic and modern education from Play Group to Class X.",
      },
      {
        property: "og:url",
        content: "https://aleman-academy.vercel.app/",
      },
      {
        property: "og:locale",
        content: "en_BD",
      },

      // Twitter / social sharing
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Al Eman Islamic Academy | Chattogram",
      },
      {
        name: "twitter:description",
        content:
          "Al Eman Islamic Academy, Chattogram — integrating Islamic and modern education from Play Group to Class X.",
      },

      // Browser UI
      {
        name: "theme-color",
        content: "#0f5132",
      },
    ],

    links: [
      // Canonical URL
      {
        rel: "canonical",
        href: "https://aleman-academy.vercel.app/",
      },

      // Styles
      {
        rel: "stylesheet",
        href: appCss,
      },

      // Favicon
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },

      // Google Fonts
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "School",
          name: "Al Eman Islamic Academy",
          alternateName: "আল ঈমান ইসলামিক একাডেমি",
          url: "https://aleman-academy.vercel.app/",
          logo: "https://aleman-academy.vercel.app/favicon.png",
          description:
            "Al Eman Islamic Academy, Chattogram — committed to integrating Islamic and modern education.",
          telephone: "+8801819802313",
          email: "alemanislamicacademy@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Kamal Para, Fotika",
            addressLocality: "Hathazari",
            addressRegion: "Chattogram",
            addressCountry: "BD",
          },
          foundingDate: "2017",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <NotFoundComponent />
        <Footer />
      </div>
    </LanguageProvider>
  ),
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const hideLayout = pathname.startsWith("/admin/") || pathname === "/admin" || pathname === "/developer";

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>

        {!hideLayout && <Header />}

        <main id="main-content">
          <Outlet />
        </main>

        {!hideLayout && <Footer />}
      </LanguageProvider>
    </QueryClientProvider>
  );
}