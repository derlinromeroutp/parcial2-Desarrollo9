import { SignUp } from '../lib/auth';

export default function Register() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <SignUp signInUrl="/login" />
    </div>
  );
}
