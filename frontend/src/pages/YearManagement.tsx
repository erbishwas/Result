'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  fetchYears,
  createYear,
  setCurrentYear,
  deleteYear,
  type Year,
} from '../components/api/year';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function YearsManagement() {
  const [years, setYears] = useState<Year[]>([]);
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    try {
      const data = await fetchYears();
      setYears(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load years. Please check authentication.');
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const created = await createYear({ year: newYear.trim() });
      setYears([...years, created]);
      setNewYear('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.year?.[0] || 'Failed to create year (possibly duplicate)';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrent = async (id: number) => {
    setError(null);
    try {
      const updated = await setCurrentYear(id);
      setYears(years.map((y) => ({ ...y, is_current: y.id === updated.id })));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set current year');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this year? This cannot be undone.')) return;

    setError(null);
    try {
      await deleteYear(id);
      setYears(years.filter((y) => y.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Cannot delete the current year');
    }
  };

  const currentYear = years.find((y) => y.is_current);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold">Year Management</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Add New Year */}
        <div className="rounded-xl shadow-lg p-8 mb-10 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-6">Add New Year</h2>
          <form onSubmit={handleAddYear} className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="e.g. 2081 or 2082"
              className="flex-1 px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-semibold flex items-center justify-center gap-3 transition"
            >
              <Plus className="w-5 h-5" />
              {loading ? 'Adding...' : 'Add Year'}
            </button>
          </form>
        </div>

        {/* Years List */}
        <div className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700 font-semibold text-xl">
            All Years ({years.length})
          </div>

          {years.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              No years added yet. Create one above to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {years.map((year) => (
                <li
                  key={year.id}
                  className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-xl font-medium">{year.year}</span>
                    {year.is_current && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="w-5 h-5" />
                        Current Year
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {!year.is_current && (
                      <button
                        onClick={() => handleSetCurrent(year.id)}
                        className="px-5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition"
                      >
                        Set as Current
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(year.id)}
                      disabled={year.is_current}
                      className={cn(
                        "p-3 rounded-lg transition",
                        year.is_current
                          ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40"
                      )}
                      title={year.is_current ? "Cannot delete current year" : "Delete year"}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current Year Summary */}
        {currentYear && (
          <div className="mt-10 p-6 rounded-xl text-center text-lg font-medium shadow-inner bg-gray-100 dark:bg-gray-800">
            Active Year:{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {currentYear.year}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}