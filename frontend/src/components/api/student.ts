// src/components/api/students.ts

import api from './axios';

// Minimal subject info (used when displaying electives in list)
export interface SubjectMini {
  id: number;
  sub_code: string;
  sub_name: string;
}

// ElectiveSub as returned in GET responses
export interface ElectiveSubResponse {
  id: number;
  student_id: number;
  sub_id: number;
  year: string;
}

// Full Student interface (matches GET all / GET by ID response)
export interface Student {
  id: number;
  roll: string;
  name: string;
  year: string;
  grade_id: number;
  is_active: boolean;
  elective_subjects: ElectiveSubResponse[];
}

// Data sent when creating a student
export interface StudentCreateData {
  roll: string;
  name: string;
  year: string;
  grade_id: number;
  is_active?: boolean; // optional, defaults to true
  elective_subjects?: {
    sub_id: number;
    year: string;
  }[];
}

// Data sent when updating a student (partial)
export interface StudentUpdateData {
  roll?: string;
  name?: string;
  year?: string;
  grade_id?: number;
  is_active?: boolean;
  elective_subjects?: {
    id?: number;
    student_id?: number;
    sub_id?: number;
    year?: string;
  }[];
}

// Get all students (filtered by user's grade on backend)
export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get('/students');
  return response.data;
};

// Create new student
export const createStudent = async (data: StudentCreateData): Promise<Student> => {
  const response = await api.post('/students', data);
  return response.data;
};

// Update existing student
export const updateStudent = async (id: number, data: StudentUpdateData): Promise<Student> => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

// Toggle student active status
export const toggleStudentActive = async (id: number): Promise<Student> => {
  const response = await api.patch(`/students/${id}/toggle-active`);
  return response.data;
};