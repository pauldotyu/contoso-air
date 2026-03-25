import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/assets/styles/globals.css";
import { BookingProvider } from "@/components/BookingProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Chat from "@/components/Chat";
import Navbar from "@/components/Navbar";
// import Error from "@/components/Errors";

const geistSans = {
  variable: GeistSans.variable,
};

const geistMono = {
  variable: GeistMono.variable,
};

export const metadata: Metadata = {
  title: "Contoso Air",
  description: "Contoso Air",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <BookingProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Chat />
            {/* <Error /> */}
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
