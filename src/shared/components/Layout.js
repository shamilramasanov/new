import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="flex justify-end items-center h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className={`inline-flex items-center px-4 py-2 text-base font-medium transition-colors rounded-md ${
              router.pathname === '/'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            Аналітика
          </Link>
          <Link
            href="/contracts"
            className={`inline-flex items-center px-4 py-2 text-base font-medium transition-colors rounded-md ml-6 ${
              router.pathname === '/contracts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            Реєстр Договорів
          </Link>
          <Link
            href="/vehicles"
            className={`inline-flex items-center px-4 py-2 text-base font-medium transition-colors rounded-md ml-6 ${
              router.pathname === '/vehicles'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            Реєстр автомобілів
          </Link>
          <Link
            href="/inventory/items"
            className={`inline-flex items-center px-4 py-2 text-base font-medium transition-colors rounded-md ml-6 ${
              router.pathname.startsWith('/inventory')
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            Склад
          </Link>
          <Link
            href="/acts"
            className={`inline-flex items-center px-4 py-2 text-base font-medium transition-colors rounded-md ml-6 ${
              router.pathname.startsWith('/acts')
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            Реєстр актів
          </Link>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}
