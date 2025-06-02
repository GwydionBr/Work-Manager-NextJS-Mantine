import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import Script from "next/script";
import { Notifications } from "@mantine/notifications";
import Layout from "@/components/AppShell/AppShell";
import { mantineTheme } from "@/theme";

export const metadata = {
  title: "Work Manager",
  description: "Work Manager is a simple task manager",
};

export default function RootLayout({ children }: { children: any }) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        {isProduction && (
          <>
            <Script
              id="sitetran-config"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `var sitetran = { site_id: ${process.env.NEXT_PUBLIC_SITETRAN_SITE_ID} };`,
              }}
            />
            <Script
              id="sitetran-widget"
              src="https://c.sitetran.com/widget/v3.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto" theme={mantineTheme}>
          <Layout>
            <Notifications />
            {children}
          </Layout>
        </MantineProvider>
        {isProduction && <div id="sitetran_translate_element" />}
      </body>
    </html>
  );
}
