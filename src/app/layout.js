import { Epilogue, Montserrat, Roboto } from "next/font/google";
import "@/styles/globals.scss";
import { ToastProvider } from "@/contexts/ToastContext";
import { AdFormProvider, CommunityMembershipProvider } from "@/contexts";
import { AuthProvider } from "@/components";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap"
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap"
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap"
});

export const metadata = {
  title: "APIA",
  description: "Social media para emprendedores y parques industriales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" data-scroll-behavior="smooth">
      <body className={`${epilogue.variable} ${roboto.variable} ${montserrat.variable}`}>
        <AuthProvider>
          <ToastProvider>
            <CommunityMembershipProvider>
              <AdFormProvider>
                {children}
              </AdFormProvider>
            </CommunityMembershipProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
