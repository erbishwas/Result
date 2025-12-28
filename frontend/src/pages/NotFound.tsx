// src/pages/NotFound.tsx or app/not-found.tsx (Next.js App Router)

'use client';

import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom'; // If using React Router
// import Link from 'next/link'; // If using Next.js

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title & Message */}
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          404
        </h1>
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
          Page Not Found
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl"
        >
          Go Back Home
        </Link>

        {/* Optional: Small footer */}
        <p className="mt-12 text-sm text-gray-500 dark:text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}