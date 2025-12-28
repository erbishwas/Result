// src/pages/Test.tsx
import { Link, useNavigate } from 'react-router-dom';

export default function Test() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
      <h1 className="text-5xl font-bold text-green-600 mb-6">✅ Routing Works!</h1>
      <p className="text-xl text-gray-700 mb-8">
        This is normal user homepage <strong>Test</strong> page.
      </p>

      <div className="space-y-4">
        <p className="text-gray-600">
          Try these navigation methods:
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Go Home (Link)
          </Link>

          <Link
            to="/about"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Go to About
          </Link>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Dashboard (Programmatic)
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Go Back
          </button>
        </div>
      </div>

      
    </div>
  );
}