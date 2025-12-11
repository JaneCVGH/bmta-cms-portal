// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/pages/login'); // เปลี่ยนเส้นทางไปหน้า login
}

