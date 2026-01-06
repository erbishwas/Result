'use client';

import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { Check, Edit2, Plus, UserX, UserCheck, ArrowRight, Save, X } from 'lucide-react';
import {
  getStudents,
  createStudent,
  updateStudent,
  toggleStudentActive,
  type Student,
} from '../../components/api/student';
import { getMyGrade } from '../../components/api/grades';
import { fetchYears } from '../../components/api/year';
import Toast from '../../components/layout/Toast';

let currentYear: string = "";

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [myGrade, setMyGrade] = useState<{ id: number; code: string; name: string } | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrade, setLoadingGrade] = useState(true);
  const [loadingYears, setLoadingYears] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    roll: '',
    name: '',
    year: '',
    grade_id: 0,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [sequentialMode, setSequentialMode] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  // Fetch user's assigned grade
  const fetchMyGrade = async () => {
    try {
      setLoadingGrade(true);
      const grade = await getMyGrade();
      setMyGrade(grade);
      setForm((prev) => ({ ...prev, grade_id: grade.id }));
    } catch (err) {
      const error = err as AxiosError;
      setToast({
        type: 'error',
        message: (error.response?.data as { detail: string }).detail || 'Failed to load your assigned grade',
      });
    } finally {
      setLoadingGrade(false);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      setLoadingYears(true);
      const data = await fetchYears();
      const temp: string[] = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].is_current) {
          currentYear = data[i].year;
        }
        temp.push(data[i].year);
      }
      setYears(temp);
      setForm((prev) => ({ ...prev, year: currentYear || temp[0] || '' }));
    } catch (err) {
      const error = err as AxiosError;
      setToast({
        type: 'error',
        message: (error.response?.data as { detail: string }).detail || 'Failed to load years',
      });
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchStudents = useCallback(async () => {
    if (!myGrade) return;
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err: unknown) {
      const error = err as AxiosError;
      setToast({
        type: 'error',
        message: (error.response?.data as { detail: string }).detail || 'Failed to load students',
      });
    } finally {
      setLoading(false);
    }
  }, [myGrade]);

  useEffect(() => {
    fetchMyGrade();
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    if (myGrade) {
      fetchStudents();
    }
  }, [myGrade, fetchStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roll || !form.name || !form.year) {
      setToast({ type: 'error', message: 'Please fill all required fields correctly' });
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      if (editingId) {
        await updateStudent(editingId, form);
        setToast({ type: 'success', message: 'Student updated successfully' });
        resetForm();
      } else {
        await createStudent(form);
        setStudentCount(prev => prev + 1);
        
        if (sequentialMode) {
          setToast({ type: 'success', message: `Student ${studentCount + 1} added successfully. Continue with next...` });
          // Reset form for next student but keep year and grade_id
          setForm(prev => ({
            roll: '',
            name: '',
            year: prev.year,
            grade_id: prev.grade_id,
          }));
        } else {
          setToast({ type: 'success', message: 'Student added successfully' });
          resetForm();
        }
      }
      await fetchStudents();
    } catch (err) {
      const error = err as AxiosError;
      setToast({ type: 'error', message: (error.response?.data as { detail: string }).detail || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    setForm({
      roll: student.roll,
      name: student.name,
      year: student.year,
      grade_id: student.grade_id,
    });
    setEditingId(student.id);
    setSequentialMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (student: Student) => {
    const newActive = !student.is_active;
    if (!window.confirm(`Are you sure you want to ${newActive ? 'activate' : 'deactivate'} this student?`)) return;

    try {
      await toggleStudentActive(student.id);
      await fetchStudents();
      setToast({ type: 'success', message: `Student ${newActive ? 'activated' : 'deactivated'} successfully` });
    } catch (err) {
      const error = err as AxiosError;
      setToast({ type: 'error', message: (error.response?.data as { detail: string }).detail || 'Failed to update status' });
    }
  };

  const startSequentialMode = () => {
    setSequentialMode(true);
    setStudentCount(0);
    setEditingId(null);
    setForm(prev => ({
      roll: '',
      name: '',
      year: prev.year,
      grade_id: prev.grade_id,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelSequentialMode = () => {
    setSequentialMode(false);
    setStudentCount(0);
    resetForm();
  };

  const finishSequentialMode = () => {
    setToast({ type: 'success', message: `Successfully added ${studentCount} student(s) in sequence` });
    setSequentialMode(false);
    setStudentCount(0);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      roll: '',
      name: '',
      year: currentYear,
      grade_id: myGrade?.id || 0,
    });
    setEditingId(null);
    setSequentialMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Students Management
            </h1>
            {loadingGrade || loadingYears ? (
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your grade...</p>
            ) : myGrade ? (
              <p className="mt-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
                Managing students for: <span className="font-bold">{myGrade.code} - {myGrade.name}</span>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {editingId ? 'Edit Student' : sequentialMode ? `Add Student ${studentCount + 1}` : 'Add New Student'}
            </h2>
            {sequentialMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Added: {studentCount} student(s)
                </span>
                <button
                  onClick={finishSequentialMode}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2 transition"
                >
                  <Check className="w-4 h-4" />
                  Finish
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  value={form.roll}
                  onChange={(e) => setForm({ ...form, roll: e.target.value })}
                  placeholder="e.g. ROLL001"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={submitting || loadingGrade || loadingYears}
                  autoFocus={sequentialMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={submitting || loadingGrade || loadingYears}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  disabled={submitting || loadingGrade || loadingYears || sequentialMode}
                >
                  <option key={currentYear} value={currentYear}>
                    {currentYear}
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              {!editingId && !sequentialMode ? (
                <>
                  <button
                    type="submit"
                    disabled={submitting || loadingGrade || loadingYears || !myGrade}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <Plus className="w-5 h-5" />
                    {submitting ? 'Saving...' : 'Add Student'}
                  </button>
                  <button
                    type="button"
                    onClick={startSequentialMode}
                    disabled={submitting || loadingGrade || loadingYears || !myGrade}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Add Multiple Students
                  </button>
                </>
              ) : sequentialMode ? (
                <>
                  <button
                    type="submit"
                    disabled={submitting || loadingGrade || loadingYears || !myGrade}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <ArrowRight className="w-5 h-5" />
                    {submitting ? 'Saving...' : 'Save & Next'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelSequentialMode}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <X className="w-5 h-5" />
                    Cancel Sequence
                  </button>
                </>
              ) : (
                // Editing mode buttons
                <>
                  <button
                    type="submit"
                    disabled={submitting || loadingGrade || loadingYears || !myGrade}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <Save className="w-5 h-5" />
                    {submitting ? 'Saving...' : 'Update Student'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* List Card */}
        <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                All Students ({students.length})
              </h2>
              {!sequentialMode && !editingId && (
                <button
                  onClick={startSequentialMode}
                  disabled={loadingGrade || loadingYears || loading || !myGrade}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  Quick Add Mode
                </button>
              )}
            </div>
          </div>

          {loadingGrade || loadingYears ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : !myGrade ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              You are not assigned to any grade.
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No students found. Add one above.
            </div>
          ) : (
            <ul>
              {students.map((student) => (
                <li
                  key={student.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {student.roll} - {student.name}
                        </span>

                        {student.is_active ? (
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
                        <p>Year: {student.year}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Edit"
                        disabled={sequentialMode}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(student)}
                        className={`p-2 rounded-lg transition ${
                          student.is_active
                            ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={student.is_active ? 'Deactivate' : 'Activate'}
                        disabled={sequentialMode}
                      >
                        {student.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}