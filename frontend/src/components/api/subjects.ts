
import api from './axios';

export interface Subject {
  id: number;
  sub_code: string;
  sub_name: string;
  Th_ch: number;
  Pr_ch: number;
  is_elective: boolean;
  is_active: boolean;
  grade_id: number;
}

export interface SubjectCreateData {
  sub_code: string;
  sub_name: string;
  Th_ch: number;
  Pr_ch: number;
  is_elective: boolean;
  grade_id: number; 
}

export interface SubjectUpdateData {
  sub_code?: string;
  sub_name?: string;
  Th_ch?: number;
  Pr_ch?: number;
  is_elective?: boolean;
  is_active?: boolean;
  grade_id?: number;
}

export interface SubjectToggleActiveData {
  is_active: boolean;
}

// Get all subjects (filtered by user's grade on backend)
export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get('/subjects');
  return response.data;
};

// Create new subject
export const createSubject = async (data: SubjectCreateData): Promise<Subject> => {
  console.log(data)
  const response = await api.post('/subjects', data);
  return response.data;
};

// Update existing subject
export const updateSubject = async (id: number, data: SubjectUpdateData): Promise<Subject> => {
  const response = await api.put(`/subjects/${id}`, data);
  return response.data;
};

// Toggle subject active status
export const toggleSubjectActive = async (id: number, is_active: boolean): Promise<Subject> => {
  const response = await api.patch(`/subjects/${id}/toggle-active`, { is_active });
  return response.data;
};

// Optional: Get only elective subjects (if needed separately)
export const getElectiveSubjects = async (): Promise<Subject[]> => {
  const response = await api.get('/subjects/electives');
  return response.data;
};