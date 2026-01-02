import api from './axios';


import { type UserMini } from './users';

export interface Grade {
  id: number;
  code: string;
  name: string;
  subject_count: number;
  has_elective: boolean;
  elective_count: number;
  grade_teacher_id: number | null;
  teacher: { id: number; username: string } | null;
  is_active: boolean;
}

export interface GradeElectiveSubject {
  id: number;
  sub_code: string;
  sub_name: string;
}

export interface GradeWithElectiveSubjects extends Grade {
  elective_subjects: GradeElectiveSubject[];
}



export interface GradeCreateData {
  code: string;
  name: string;
  subject_count: number;
  has_elective: boolean;
  elective_count: number;
  grade_teacher_id?: number | null;
}

export interface GradeUpdateData {
  code?: string;
  name?: string;
  subject_count?: number;
  has_elective?: boolean;
  elective_count?: number;
  grade_teacher_id?: number | null;
}

export interface GradeToggleActiveData {
  is_active: boolean;
}

// Get all grades
export const getGrades = async (): Promise<Grade[]> => {
  const response = await api.get('/grades');
  return response.data;
};

// Get available teachers for grade assignment
export const getAvailableGradeTeachers = async (): Promise<UserMini[]> => {
  const response = await api.get('/grades/available-grade-teachers');

  return response.data;
};

// Create new grade
export const createGrade = async (data: GradeCreateData): Promise<Grade> => {
  const response = await api.post('/grades', data);
  return response.data;
};

// Update existing grade
export const updateGrade = async (id: number, data: GradeUpdateData): Promise<Grade> => {
  const response = await api.put(`/grades/${id}`, data);
  return response.data;
};

// Toggle grade active status
export const toggleGradeActive = async (id: number, is_active: boolean): Promise<Grade> => {
  const response = await api.patch(`/grades/${id}/toggle-active`, { is_active });
  return response.data;
};

export const getMyGrade = async (): Promise<GradeWithElectiveSubjects>  => {
  const response = await api.get('/grades/grade-by-user');
  return response.data;
}
