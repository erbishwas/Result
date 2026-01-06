// src/components/api/elective.ts

import api from './axios';

export interface ElectiveSubResponse {
  id: number;
  sub_id: number;
  year: string;
}

export interface StudentWithElectiveSub {
  id: number;
  roll: string;
  name: string;
  elective_subjects: ElectiveSubResponse[];
}

export interface ElectiveSubCreate {
  student_id: number;  
  sub_id: number;
  year: string;
}

export interface ElectiveSubUpdate {
  id: number;
  sub_id: number;
  year: string;
  student_id: number;
}

// Get all students with their elective subjects
export const getStudentsWithElectives = async (): Promise<StudentWithElectiveSub[]> => {
  const response = await api.get('/electives/');
  return response.data;
};

// Get elective subjects for a specific student
export const getStudentElectives = async (studentId: number): Promise<ElectiveSubResponse[]> => {
  const response = await api.get(`/electives/student/${studentId}`);
  return response.data;
};

// Create elective subject for a student
export const createElective = async (studentId: number, data: ElectiveSubCreate): Promise<ElectiveSubResponse> => {
  const response = await api.post(`/electives/${studentId}`, data);
  return response.data;
};

export const updateElective = async (electiveId: number, data: ElectiveSubUpdate): Promise<ElectiveSubResponse> => {
  const response = await api.put(`/electives/${electiveId}`, data);
  return response.data;
};

