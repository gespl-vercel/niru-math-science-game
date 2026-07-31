import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="page auth-page">
      <div className="page-hero">
        <p className="eyebrow">New player</p>
        <h1>Create account</h1>
        <p className="lede">Optional — guests can play without signing up.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
