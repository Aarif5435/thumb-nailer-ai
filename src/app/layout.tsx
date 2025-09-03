import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Thumb-nailer - Professional Thumbnail AI",
  description: "Create viral YouTube thumbnails with AI",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          footer: "hidden",
          footerText: "hidden",
          footerAction: "hidden"
        }
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
          <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/favicon.ico?v=3" />
          <link rel="manifest" href="/manifest.json" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Hide Clerk development mode notification
                function hideClerkNotification() {
                  const notifications = document.querySelectorAll('[data-clerk-element="footer"], .cl-footer, .cl-cardFooter');
                  notifications.forEach(el => {
                    if (el.textContent && el.textContent.includes('This is a hosted version of Clerk')) {
                      el.style.display = 'none';
                    }
                  });
                  
                  // Also hide any fixed positioned elements in bottom right
                  const fixedElements = document.querySelectorAll('div[style*="position: fixed"][style*="bottom"][style*="right"]');
                  fixedElements.forEach(el => {
                    if (el.textContent && el.textContent.includes('Clerk')) {
                      el.style.display = 'none';
                    }
                  });
                }
                
                // Run on page load
                document.addEventListener('DOMContentLoaded', hideClerkNotification);
                
                // Run periodically to catch dynamically added elements
                setInterval(hideClerkNotification, 1000);
              `,
            }}
          />
        </head>
              <body className={inter.className}>
        {children}
        <Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(() => console.log('Service worker registered'))
                  .catch(() => console.log('Service worker registration failed'));
              }
            `,
          }}
        />
      </body>
      </html>
    </ClerkProvider>
  );
}
