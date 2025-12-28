

import api from './axios';  

export interface Year {
  id: number;
  year: string;
  is_current: boolean;
}

export interface YearCreate {
  year: string;
}

// Get all years
export const fetchYears = async (): Promise<Year[]> => {
  const response = await api.get('/years/');
  return response.data;
};

// Create a new year
export const createYear = async (data: YearCreate): Promise<Year> => {
  const response = await api.post('/years/', data);
  return response.data;
};

// Set a year as current
export const setCurrentYear = async (id: number): Promise<Year> => {
  const response = await api.patch(`/years/${id}/set-current`);
  return response.data;
};

// Delete a year
export const deleteYear = async (id: number): Promise<void> => {
  await api.delete(`/years/${id}`);
};

// Optional: Get current year only
export const fetchCurrentYear = async (): Promise<Year> => {
  const response = await api.get('/years/current');
  return response.data;
};