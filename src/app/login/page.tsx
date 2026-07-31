import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="page auth-page">
      <div className="page-hero">
        <p className="eyebrow">Account</p>
        <h1>Welcome back</h1>
        <p className="lede">
          Sign in to save scores — or skip and play as a guest from Play.
        </p>
      </div>
      <LoginForm />
      <div className="hint-box">
        Default admin: <strong>admin@niru.local</strong> / <strong>Admin@123</strong>
      </div>
    </div>
  );
}
