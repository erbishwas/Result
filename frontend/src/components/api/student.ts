// src/components/api/students.ts

import api from './axios';

// Minimal subject info (used when displaying electives in list)


// Full Student interface (matches GET all / GET by ID response)
export interface Student {
  id: number;
  roll: string;
  name: string;
  year: string;
  grade_id: number;
  is_active: boolean;
}

// Data sent when creating a student
export interface StudentCreateData {
  roll: string;
  name: string;
  year: string;
  grade_id: number;
  is_active?: boolean; // optional, defaults to true
  
}

// Data sent when updating a student (partial)
export interface StudentUpdateData {
  roll?: string;
  name?: string;
  year?: string;
  grade_id?: number;
  is_active?: boolean;
  
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