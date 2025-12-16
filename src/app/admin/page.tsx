'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if authenticated, redirect accordingly
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();

        if (data.success && data.authenticated) {
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  );
}
