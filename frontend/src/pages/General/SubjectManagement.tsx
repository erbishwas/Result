'use client';

import { useState, useEffect } from 'react';
import { Check, Edit2, Plus, UserX, UserCheck } from 'lucide-react';
import {
  getSubjects,
  createSubject,
  updateSubject,
  toggleSubjectActive,
  type Subject,
} from '../../components/api/subjects';

import { getMyGrade, type Grade } from '../../components/api/grades';
import Toast from "../../components/layout/Toast";

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [myGrade, setMyGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGrade, setLoadingGrade] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    sub_code: '',
    sub_name: '',
    Th_ch: '',
    Pr_ch: '',
    is_elective: false,
    grade_id: 0,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch user's assigned grade
  const fetchMyGrade = async () => {
    try {
      setLoadingGrade(true);
      const grade = await getMyGrade();
      setMyGrade(grade);
      setForm((prev) => ({ ...prev, grade_id: grade.id }));
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load your assigned grade',
      });
    } finally {
      setLoadingGrade(false);
    }
  };

  // Fetch subjects for the user's grade
  const fetchSubjects = async () => {
    if (!myGrade) return;
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
      console.log('Raw subjects from API:', data);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load subjects',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGrade();
  }, []);

  useEffect(() => {
    if (myGrade) {
      fetchSubjects();
    }
  }, [myGrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sub_code || !form.sub_name || parseFloat(form.Th_ch) < 0 || parseFloat(form.Pr_ch) < 0) {
      setToast({ type: 'error', message: 'Please fill all required fields correctly' });
      return;
    }

    setSubmitting(true);

    try {
      const formattedForm = {
        ...form,
        Th_ch: parseFloat(form.Th_ch),
        Pr_ch: parseFloat(form.Pr_ch),
      };
      if (editingId) {
        await updateSubject(editingId, formattedForm);
        setToast({ type: 'success', message: 'Subject updated successfully' });
      } else {
        await createSubject(formattedForm);
        setToast({ type: 'success', message: 'Subject added successfully' });
      }
      resetForm();
      await fetchSubjects();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Operation failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    
    setForm({
      sub_code: subject.sub_code,
      sub_name: subject.sub_name,
      Th_ch: subject.Th_ch.toString(),
      Pr_ch: subject.Pr_ch.toString(),
      is_elective: subject.is_elective,
      grade_id: myGrade!.id,
    });
    setEditingId(subject.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (subject: Subject) => {
    const newActive = !subject.is_active;
    if (
      !window.confirm(
        `Are you sure you want to ${newActive ? 'activate' : 'deactivate'} this subject?`
      )
    )
      return;

    try {
      await toggleSubjectActive(subject.id, newActive);
      await fetchSubjects();
      setToast({
        type: 'success',
        message: `Subject ${newActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to update status',
      });
    }
  };

  const resetForm = () => {
    setForm({
      sub_code: '',
      sub_name: '',
      Th_ch: '',
      Pr_ch: '',
      is_elective: false,
      grade_id: myGrade?.id || 0,
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Subjects Management
            </h1>
            {loadingGrade ? (
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your grade...</p>
            ) : myGrade ? (
              <p className="mt-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
                Managing subjects for:{' '}
                <span className="font-bold">
                  {myGrade.code} - {myGrade.name}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-red-600 dark:text-red-400">
                No grade assigned. Contact administrator.
              </p>
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {editingId ? 'Edit Subject' : 'Add New Subject'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={form.sub_code}
                  onChange={(e) => setForm({ ...form, sub_code: e.target.value })}
                  placeholder="e.g. MATH101"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={loadingGrade}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={form.sub_name}
                  onChange={(e) => setForm({ ...form, sub_name: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={loadingGrade}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theory Credit Hours *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.Th_ch}
                  onChange={(e) => setForm({ ...form, Th_ch: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={loadingGrade}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Practical Credit Hours *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.Pr_ch}
                  onChange={(e) => setForm({ ...form, Pr_ch: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={loadingGrade}
                />
              </div>

              <div className="flex items-center space-x-3 md:col-span-2">
                <input
                  type="checkbox"
                  id="is_elective"
                  checked={form.is_elective}
                  onChange={(e) => setForm({ ...form, is_elective: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  disabled={loadingGrade}
                />
                <label htmlFor="is_elective" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This is an Elective Subject
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || loadingGrade || !myGrade}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                {submitting ? 'Saving...' : editingId ? 'Update Subject' : 'Add Subject'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Subjects List */}
        <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              All Subjects
            </h2>
          </div>

          {loadingGrade ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading your grade assignment...
            </div>
          ) : !myGrade ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              You are not assigned to any grade.
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No subjects found. Add one above.
            </div>
          ) : (
            <ul>
              {subjects.map((subject) => (
                <li
                  key={subject.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {subject.sub_code} - {subject.sub_name}
                        </span>

                        {subject.is_elective && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Elective
                          </span>
                        )}

                        {subject.is_active ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            <UserX className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Theory: {subject.Th_ch} hours</p>
                        <p>Practical: {subject.Pr_ch} hours</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(subject)}
                        className={`p-2 rounded-lg transition ${
                          subject.is_active
                            ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={subject.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {subject.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}