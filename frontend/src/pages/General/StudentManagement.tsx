'use client';

import { useState, useEffect } from 'react';
import { Check, Edit2, Plus, UserX, UserCheck } from 'lucide-react';
import {
  getStudents,
  createStudent,
  updateStudent,
  toggleStudentActive,
  type Student,
} from '../../components/api/student';
import { getMyGrade, type GradeWithElectiveSubjects } from '../../components/api/grades';
import { fetchYears,type Year } from '../../components/api/year';
import Toast from '../../components/layout/Toast';


let currentYear: string = "";
export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [myGrade, setMyGrade] = useState<GradeWithElectiveSubjects | null>(null);
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
    selectedElectives: [] as number[],
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch grade
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

  // Fetch available years
  const getYears = async () => {
    try {
      setLoadingYears(true);
      const data = await fetchYears();
      const temp:string[]=[];
      for (let i = 0; i < data.length; i++) {
        if(data[i].is_current){currentYear=data[i].year;}
        temp.push(data[i].year);
      }
      
      setYears(temp);
      
      setForm((prev) => ({ ...prev, year: temp[0] }));
      
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load years',
      });
      // Fallback years
     
    } finally {
      setLoadingYears(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    if (!myGrade) return;
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load students',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGrade();
    getYears();
  }, []);

  useEffect(() => {
    if (myGrade) {
      fetchStudents();
    }
  }, [myGrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.roll || !form.name) {
      setToast({ type: 'error', message: 'Please fill roll and name' });
      return;
    }

    if (!editingId && myGrade?.has_elective) {
      if (form.selectedElectives.length !== myGrade.elective_count) {
        setToast({
          type: 'error',
          message: `Please select exactly ${myGrade.elective_count} elective subject(s)`,
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload: any = {
        roll: form.roll,
        name: form.name,
        year: form.year,
        grade_id: form.grade_id,
      };

      // Only include elective_subjects on create
      if (!editingId && myGrade?.has_elective && form.selectedElectives.length > 0) {
        payload.elective_subjects = form.selectedElectives.map((sub_id) => ({
          sub_id,
          year: form.year, // Same year as student
        }));
      }

      if (editingId) {
        await updateStudent(editingId, payload);
        setToast({ type: 'success', message: 'Student updated successfully' });
      } else {
        await createStudent(payload);
        setToast({ type: 'success', message: 'Student added successfully' });
      }

      resetForm();
      await fetchStudents();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Operation failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    setForm({
      roll: student.roll,
      name: student.name,
      year: student.year,
      grade_id: myGrade!.id,
      selectedElectives: student.elective_subjects.map((e) => e.sub_id),
    });
    setEditingId(student.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (student: Student) => {
    const newActive = !student.is_active;
    if (!window.confirm(`Are you sure you want to ${newActive ? 'activate' : 'deactivate'} this student?`))
      return;

    try {
      await toggleStudentActive(student.id);
      await fetchStudents();
      setToast({
        type: 'success',
        message: `Student ${newActive ? 'activated' : 'deactivated'} successfully`,
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
      roll: '',
      name: '',
      year: years[0],
      grade_id: myGrade?.id || 0,
      selectedElectives: [],
    });
    setEditingId(null);
  };

  // Lookup subject name from grade's elective list
  const getSubjectDisplay = (subId: number) => {
    const subj = myGrade?.elective_subjects?.find((s) => s.id === subId);
    return subj ? `${subj.sub_code} - ${subj.sub_name}` : `ID: ${subId}`;
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
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
            ) : myGrade ? (
              <div className="mt-2 space-y-1">
                <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                  Managing students for:{' '}
                  <span className="font-bold">{myGrade.code} - {myGrade.name}</span>
                </p>
                {myGrade.has_elective && (
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Requires {myGrade.elective_count} elective subject(s)
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-red-600 dark:text-red-400">
                No grade assigned. Contact administrator.
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {editingId ? 'Edit Student' : 'Add New Student'}
          </h2>

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
                  placeholder="e.g. 001"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={loadingGrade || loadingYears}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  required
                  disabled={loadingGrade || loadingYears}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Academic Year *
                </label>
                <select
                   value={currentYear}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  disabled={loadingGrade || loadingYears}
                >
                  {years.map((year) => (
                    <option key={year} value={year} >
                      {year} {year===currentYear && '(Current)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Elective Selection */}
              {myGrade?.has_elective && !editingId && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Elective Subjects * (Select exactly {myGrade.elective_count})
                  </label>
                  {myGrade.elective_subjects.length === 0 ? (
                    <p className="text-orange-600 dark:text-orange-400">
                      No elective subjects available for this grade.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {myGrade.elective_subjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={form.selectedElectives.includes(subject.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({
                                  ...form,
                                  selectedElectives: [...form.selectedElectives, subject.id],
                                });
                              } else {
                                setForm({
                                  ...form,
                                  selectedElectives: form.selectedElectives.filter(
                                    (id) => id !== subject.id
                                  ),
                                });
                              }
                            }}
                            className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {subject.sub_code} - {subject.sub_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {form.selectedElectives.length} / {myGrade.elective_count}
                  </p>
                </div>
              )}

              {/* Read-only electives on edit */}
              {editingId && myGrade?.has_elective && form.selectedElectives.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned Electives (Cannot be changed)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.selectedElectives.map((subId) => (
                      <span
                        key={subId}
                        className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {getSubjectDisplay(subId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || loadingGrade || loadingYears || !myGrade}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                {submitting ? 'Saving...' : editingId ? 'Update Student' : 'Add Student'}
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

        {/* Students List */}
        <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              All Students ({students.length})
            </h2>
          </div>

          {loadingGrade || loadingYears ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : !myGrade ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              You are not assigned to any grade.
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading students...</div>
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

                        {myGrade?.has_elective && student.elective_subjects.length > 0 && (
                          <div>
                            <span className="font-medium text-purple-700 dark:text-purple-300">
                              Electives ({student.elective_subjects.length}):
                            </span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {student.elective_subjects.map((elective) => (
                                <span
                                  key={elective.id}
                                  className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                >
                                  {getSubjectDisplay(elective.sub_id)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Edit"
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