import { redirect } from 'next/navigation';

export default function MockTestsPage() {
  redirect('/register');
}
