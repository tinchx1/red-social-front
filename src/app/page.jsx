import "@/styles/pages/home.scss";
import { LoginForm } from "@/components";
import AuthGuardClient from "@/components/layout/AuthGuardClient";

export default function HomePage() {
  return (
    <main className="homepage">
      <AuthGuardClient />
      <LoginForm />
    </main>
  );
} 