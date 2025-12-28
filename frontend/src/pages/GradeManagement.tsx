'use client';

import { useState, useEffect } from 'react';
import { Check, Edit2, Plus, UserX, UserCheck } from 'lucide-react';
import {
  getGrades,
  getAvailableGradeTeachers,
  createGrade,
  updateGrade,
  toggleGradeActive,
  type Grade, 
} from '../components/api/grades';

import { getAllUsers, type UserMini, } from '../components/api/users';

export default function GradesManagement() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<UserMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userMap, setUserMap] = useState<Record<number, string>>({});

  const [form, setForm] = useState({
    code: '',
    name: '',
    subject_count: 0,
    has_elective: false,
    elective_count: 0,
    grade_teacher_id: null as number | null,
  });

  const [editingId, setEditingId] = useState<number | null>(null);


  useEffect(() => {
    getAllUsers().then((users) => {
      const map: Record<number, string> = {};
      users.forEach((u) => {
        map[u.id] = u.username;
      });
      setUserMap(map);
    });
  }, []);

  const fetchGrades = async () => {
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

 

  const fetchAvailableTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const data = await getAvailableGradeTeachers();
      setTeachers(data);
      
    } catch (err: any) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchAvailableTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name || form.subject_count <= 0) {
      setError('Please fill all required fields correctly');
      return;
    }

    setSubmitting(true);
    setError(null);
    if(form.elective_count>form.subject_count){
      setError('Elective count cannot be greater than subject count');
      setSubmitting(false);
      return;
    }
    try {
      if (editingId) {
        await updateGrade(editingId, form);
      } else {
        await createGrade(form);
      }
      resetForm();
      await fetchGrades();
      await fetchAvailableTeachers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (grade: Grade) => {
    setForm({
      code: grade.code,
      name: grade.name,
      subject_count: grade.subject_count,
      has_elective: grade.has_elective,
      elective_count: grade.elective_count,
      grade_teacher_id: grade.grade_teacher_id,
    });
    setEditingId(grade.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (grade: Grade) => {
    if (!window.confirm(
      `Are you sure you want to ${grade.is_active ? 'deactivate' : 'activate'} this grade?`
    )) return;

    try {
      await toggleGradeActive(grade.id, !grade.is_active);
      await fetchGrades();
      await fetchAvailableTeachers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      subject_count: 0,
      has_elective: false,
      elective_count: 0,
      grade_teacher_id: null,
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
              Grades Management
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {editingId ? 'Edit Grade' : 'Add New Grade'}
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tenth Grade"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Count *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.subject_count}
                  onChange={(e) => setForm({ ...form, subject_count: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade Teacher
                </label>
                <select
                  value={form.grade_teacher_id ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      grade_teacher_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                >
                  {editingId ?<option value={form.grade_teacher_id}>{userMap[form.grade_teacher_id]}</option>
                  :<option value="">None (Optional)</option>
                }
                  {loadingTeachers ? (
                    <option disabled>Loading teachers...</option>
                  ) : (
                    
                    teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.username}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="has_elective"
                  checked={form.has_elective}
                  onChange={(e) => setForm({ ...form, has_elective: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="has_elective" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Has Elective Subjects
                </label>
              </div>

              {form.has_elective && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Elective Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.elective_count}
                    onChange={(e) => setForm({ ...form, elective_count: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                {submitting ? 'Saving...' : editingId ? 'Update Grade' : 'Add Grade'}
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

        {/* List Card */}
        <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              All Grades
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading grades...
            </div>
          ) : grades.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No grades found. Add one above.
            </div>
          ) : (
            <ul>
              {grades.map((grade) => (
                <li
                  key={grade.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {grade.code} - {grade.name}
                        </span>

                        {grade.is_active ? (
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
                        <p>Subjects: {grade.subject_count}</p>
                        <p>
                          Electives: {grade.has_elective ? `Yes (${grade.elective_count})` : 'No'}
                        </p>
                        <p>
                          Assigned Teacher: {grade.grade_teacher_id ? userMap[grade.grade_teacher_id] || "Loading..." : "None"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(grade)}
                        className={`p-2 rounded-lg transition ${
                          grade.is_active
                            ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={grade.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {grade.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}