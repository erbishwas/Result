'use client';

import { useState, useEffect } from 'react';
import { Loader2, } from 'lucide-react';
import { getGrades, type Grade } from '../components/api/grades';
import { submitSelectedGrade, fetchAdminGradeSelection } from '../components/api/users';
import Toast from '../components/layout/Toast';
import { useChange } from '../components/auth/ChangeContext';

export interface GradeOut {
  id: number;
  grade_code: string;
  name: string;
}

// You can add this later if needed for submission
export interface GradeSelectPayload {
  selected_grade_id: number;
}

export default function SelectGradePage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [grade, setGrade] = useState<Grade>();
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {notifyChange}= useChange();

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGrades();
      setGrades(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedGrade = async () => {
    try {
      const data = await fetchAdminGradeSelection();        
      setGrade(data);
      console.log("Grade"+data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load selected grade');
    }
  };

  useEffect(() => {
    loadGrades();
    loadSelectedGrade();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGradeId) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await submitSelectedGrade(selectedGradeId);
      setSuccess('Grade selected and submitted successfully');
      notifyChange();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit selected grade');
    } finally {
      setSubmitting(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Select Active Grade
            </h1>
          </div>
        </div>

        {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
        {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Grade Selection Card */}
        <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Choose the current active grade
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : grades.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No grades available.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Grade
                </label>
                <select
                  value={selectedGradeId || ''}
                  onChange={(e) => setSelectedGradeId(Number(e.target.value))}
                  required
                  className="w-full px-5 py-4 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
                >
                  <option value="" disabled>
                    -- Choose a grade --
                  </option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.code} - {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Selection Preview */}
              {grade && (
                <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                    Current Selection:
                  </p>
                  <p className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                    {grade.code} — {grade.name}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !selectedGradeId}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-lg rounded-lg flex items-center gap-3 transition disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-6 h-6 animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Selected Grade'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}