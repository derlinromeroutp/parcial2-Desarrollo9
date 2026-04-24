import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <SignIn signUpUrl="/register" />
    </div>
  );
}
