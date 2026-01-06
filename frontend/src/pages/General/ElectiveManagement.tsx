'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, X, ArrowRight, User, BookOpen, Save } from 'lucide-react';
import {
  getStudentsWithElectives,
  createElective,
  updateElective,
  type StudentWithElectiveSub,
  type ElectiveSubResponse,
} from '../../components/api/elective';
import { getMyGrade, type GradeWithElectiveSubjects } from '../../components/api/grades';
import { fetchYears } from '../../components/api/year';
import Toast from '../../components/layout/Toast';

export default function ElectiveManagement() {
  const [students, setStudents] = useState<StudentWithElectiveSub[]>([]);
  const [myGrade, setMyGrade] = useState<GradeWithElectiveSubjects | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingGrade, setLoadingGrade] = useState(true);
  const [loadingYears, setLoadingYears] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States for step-by-step creation
  const [currentStep, setCurrentStep] = useState<'list' | 'create' | 'continue'>('list');
  const [currentStudent, setCurrentStudent] = useState<StudentWithElectiveSub | null>(null);
  const [selectedElectives, setSelectedElectives] = useState<number[]>([]);
  const [existingElectiveData, setExistingElectiveData] = useState<ElectiveSubResponse[]>([]);
  const [creatingForAll, setCreatingForAll] = useState(false);
  const [pendingStudents, setPendingStudents] = useState<StudentWithElectiveSub[]>([]);

  // Fetch user's assigned grade
  const fetchMyGrade = async () => {
    try {
      setLoadingGrade(true);
      const grade = await getMyGrade();
      setMyGrade(grade);
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
  const fetchAvailableYears = async () => {
    try {
      setLoadingYears(true);
      const data = await fetchYears();
      const tempYears: string[] = [];
      let currentYr = '';
      
      data.forEach((year: any) => {
        if (year.is_current) {
          currentYr = year.year;
        }
        tempYears.push(year.year);
      });
      
      setYears(tempYears);
      setCurrentYear(currentYr || tempYears[0] || '');
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load years',
      });
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const data = await getStudentsWithElectives();
      setStudents(data);
      
      // Find students without electives for current year
      const studentsWithoutElectives = data.filter(student => 
        student.elective_subjects.length === 0 || 
        !student.elective_subjects.some(e => e.year === currentYear)
      );
      setPendingStudents(studentsWithoutElectives);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load students with electives',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGrade();
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    if (myGrade && currentYear) {
      fetchStudentsData();
    }
  }, [myGrade, currentYear]);

  const handleStartCreate = (student: StudentWithElectiveSub, forAll: boolean = false) => {
    setCurrentStudent(student);
    setCreatingForAll(forAll);
    setCurrentStep('create');

    const currentYearElectives = student.elective_subjects.filter(e => e.year === currentYear);

    const slots: ElectiveSubResponse[] = [];
    const selected: number[] = [];

    // Fill up to elective_count
    for (let i = 0; i < (myGrade?.elective_count || 0); i++) {
      if (currentYearElectives[i]) {
        slots.push(currentYearElectives[i]);
        selected.push(currentYearElectives[i].sub_id);
      } else {
        slots.push({ id: 0, sub_id: 0, year: currentYear });
      }
    }

    setExistingElectiveData(slots);
    setSelectedElectives(selected);
  };

  const handleSelectElective = (subId: number) => {
    const maxElectives = myGrade?.elective_count || 0;

    if (selectedElectives.includes(subId)) {
      // DESELECT: Find the index and clear the sub_id, but keep the slot
      const index = existingElectiveData.findIndex(e => e.sub_id === subId);
      if (index === -1) return;

      const newSelected = selectedElectives.filter(id => id !== subId);
      const newExisting = [...existingElectiveData];
      newExisting[index] = { ...newExisting[index], sub_id: 0 };

      setSelectedElectives(newSelected);
      setExistingElectiveData(newExisting);
    } else {
      // SELECT: Fill the first empty slot (sub_id === 0)
      const emptyIndex = existingElectiveData.findIndex(e => e.sub_id === 0);
      
      if (emptyIndex === -1) {
        // No empty slot → check if we can add (only if under limit)
        if (selectedElectives.length >= maxElectives) {
          setToast({
            type: 'error',
            message: `You can only select exactly ${maxElectives} elective subjects`
          });
          return;
        }
        // This is a completely new one (shouldn't happen in update mode, but safe)
        setSelectedElectives(prev => [...prev, subId]);
        setExistingElectiveData(prev => [...prev, { id: 0, sub_id: subId, year: currentYear }]);
      } else {
        // Fill the empty slot
        const newExisting = [...existingElectiveData];
        newExisting[emptyIndex] = { ...newExisting[emptyIndex], sub_id: subId };
        
        setSelectedElectives(prev => [...prev, subId]);
        setExistingElectiveData(newExisting);
      }
    }
  };

  const handleSaveElectives = async () => {
    if (!currentStudent || !myGrade) return;

    if (selectedElectives.length !== myGrade.elective_count) {
      setToast({
        type: 'error',
        message: `Please select exactly ${myGrade.elective_count} elective subjects`
      });
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      // Handle each elective based on whether it's an update or create
      for (const elective of existingElectiveData) {
        if (elective.sub_id === 0) continue; // safety, shouldn't happen

        if (elective.id > 0) {
          // UPDATE: Use PUT request with full data
          await updateElective(elective.id, {
            id: elective.id,
            sub_id: elective.sub_id,
            year: currentYear,
            student_id: currentStudent.id,
          });
        } else {
          // CREATE: Use POST request
          await createElective(currentStudent.id, {
            student_id: currentStudent.id,
            sub_id: elective.sub_id,
            year: currentYear,
          });
        }
      }

      setToast({ type: 'success', message: 'Elective subjects saved successfully' });
      
      if (creatingForAll) {
        // Move to next student or finish
        const nextPending = pendingStudents.filter(s => s.id !== currentStudent.id);
        if (nextPending.length > 0) {
          setCurrentStudent(nextPending[0]);
          setSelectedElectives([]);
          setExistingElectiveData([]);
          setPendingStudents(nextPending);
        } else {
          setCurrentStep('list');
          setCreatingForAll(false);
          setCurrentStudent(null);
          await fetchStudentsData();
        }
      } else {
        setCurrentStep('list');
        setCurrentStudent(null);
        await fetchStudentsData();
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to save elective subjects'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueNext = () => {
    if (!currentStudent || !pendingStudents.length) return;
    
    const nextPending = pendingStudents.filter(s => s.id !== currentStudent.id);
    if (nextPending.length > 0) {
      setCurrentStudent(nextPending[0]);
      setSelectedElectives([]);
      setExistingElectiveData([]);
      setPendingStudents(nextPending);
    }
  };

  const handleCancelCreate = () => {
    setCurrentStep('list');
    setCurrentStudent(null);
    setSelectedElectives([]);
    setExistingElectiveData([]);
    setCreatingForAll(false);
  };

  // Helper to get subject display name
  const getSubjectDisplay = (subId: number) => {
    const subject = myGrade?.elective_subjects.find((s) => s.id === subId);
    return subject ? `${subject.sub_code} - ${subject.sub_name}` : `Unknown (${subId})`;
  };

  // Helper to check if elective is existing or new
  const isExistingElective = (subId: number) => {
    const elective = existingElectiveData.find(e => e.sub_id === subId);
    return elective?.id > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Elective Subjects Management
            </h1>
            {loadingGrade || loadingYears ? (
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your grade...</p>
            ) : myGrade ? (
              <div>
                <p className="mt-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
                  Managing electives for: <span className="font-bold">{myGrade.code} - {myGrade.name}</span>
                </p>
                {myGrade.has_elective && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Required: {myGrade.elective_count} elective subject(s) per student
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

        {/* Year Selector */}
        <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Academic Year
          </label>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            disabled={loadingYears || currentStep !== 'list'}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Main Content */}
        {currentStep === 'list' && myGrade?.has_elective ? (
          <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Students & Electives
                </h2>
                {pendingStudents.length > 0 && (
                  <button
                    onClick={() => handleStartCreate(pendingStudents[0], true)}
                    disabled={!myGrade?.has_elective}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Assign Electives to All ({pendingStudents.length} remaining)
                  </button>
                )}
              </div>
              {pendingStudents.length > 0 && (
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  {pendingStudents.length} student(s) need elective assignments for {currentYear}
                </p>
              )}
            </div>

            {loadingGrade || loadingYears ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : !myGrade ? (
              <div className="p-8 text-center text-red-600 dark:text-red-400">
                You are not assigned to any grade.
              </div>
            ) : !myGrade.has_elective ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Your grade does not have elective subjects.
              </div>
            ) : loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No students found.
              </div>
            ) : (
              <ul>
                {students.map((student) => {
                  const hasElectives = student.elective_subjects.some(e => e.year === currentYear);
                  const studentElectives = student.elective_subjects.filter(e => e.year === currentYear);
                  
                  return (
                    <li
                      key={student.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                {student.roll} - {student.name}
                              </span>
                            </div>
                            
                            {hasElectives ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <Check className="w-3 h-3" />
                                Electives Assigned
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                <BookOpen className="w-3 h-3" />
                                Needs Electives
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {hasElectives ? (
                              <div>
                                <span className="font-medium text-purple-700 dark:text-purple-300">
                                  Electives ({studentElectives.length}):
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {studentElectives.map((elective) => (
                                    <span
                                      key={elective.id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    >
                                      {getSubjectDisplay(elective.sub_id)}
                                      
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-orange-600 dark:text-orange-400">
                                No electives assigned for {currentYear}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStartCreate(student, false)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition"
                          >
                            <BookOpen className="w-4 h-4" />
                            {hasElectives ? 'Update Electives' : 'Assign Electives'}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : currentStep === 'create' && currentStudent && myGrade  && myGrade.has_elective ? (
          <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {creatingForAll ? 'Assign Electives to All Students' : 'Manage Electives'}
              </h2>
              {creatingForAll && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    {pendingStudents.findIndex(s => s.id === currentStudent.id) + 1} of {pendingStudents.length + 1}
                  </span> students remaining
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {currentStudent.roll} - {currentStudent.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Academic Year: {currentYear} | Student ID: {currentStudent.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Elective Selection */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Elective Subjects ({myGrade.elective_count} required)
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {selectedElectives.length}/{myGrade.elective_count}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGrade.elective_subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedElectives.includes(subject.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedElectives.includes(subject.id)}
                      onChange={() => handleSelectElective(subject.id)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      disabled={submitting}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {subject.sub_code} - {subject.sub_name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {selectedElectives.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Electives:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedElectives.map((subId, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {getSubjectDisplay(subId)}
                        {/* <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                          {isExistingElective(subId) ? `Update (ID: ${existingElectiveData.find(e => e.sub_id === subId)?.id})` : 'New'}
                        </span> */}
                        <button
                          type="button"
                          onClick={() => handleSelectElective(subId)}
                          className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveElectives}
                disabled={submitting || selectedElectives.length !== myGrade.elective_count}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center gap-2 transition"
              >
                <Save className="w-5 h-5" />
                {submitting ? 'Saving...' : creatingForAll ? 'Save & Continue' : 'Save Electives'}
              </button>

              {creatingForAll && (
                <button
                  onClick={handleContinueNext}
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium rounded-lg flex items-center gap-2 transition"
                >
                  <ArrowRight className="w-5 h-5" />
                  Skip & Continue
                </button>
              )}

              <button
                onClick={handleCancelCreate}
                disabled={submitting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center gap-2 transition"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        {myGrade && !myGrade.has_elective && (
          <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
            Your assigned grade does not have elective subjects.
          </div>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}