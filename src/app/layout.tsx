import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import React from "react";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import Layout from "@/components/AppShell/AppShell";
import { theme } from "../theme";

export const metadata = {
  title: "Work Manager",
  description: "Work Manager is a simple task manager",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <Layout>
            <Notifications />
            {children}
          </Layout>
        </MantineProvider>
      </body>
    </html>
  );
}
