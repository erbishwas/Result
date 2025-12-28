import api from './axios';
import { type Grade } from './grades';



export interface UserMini {
  id: number;
  username: string;
  grade_code: string | null;
  is_admin: boolean;
}

export interface UserRegister {
  username: string;
  password: string;
  grade_code: string | null;
  is_admin: boolean;
}

export interface UserUpdate {
  username?: string;
  grade_code?: string | null;
  is_admin?: boolean;
}

export const getAllUsers = async (): Promise<UserMini[]> => {
  const response = await api.get(`/auth/allusers`);
  return response.data;
}

export const fetchAllUsers = async (): Promise<UserMini[]> => {
  const response = await api.get('/auth/allusers');
  return response.data;
};


export const registerUser = async (data: UserRegister): Promise<{ message: string }> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};


export const resetUserPassword = async (userId: number, newPassword: string): Promise<{ message: string }> => {
  console.log("API Call - resetUserPassword:", { userId, newPassword });
  const response = await api.post('/auth/reset-password', { user_id: userId, new_password: newPassword });
  return response.data;
};


export const deleteUser = async (userId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/auth/${userId}/delete-user`);
  return response.data;
};

export const updateUser = async (userId: number, data: UserUpdate): Promise<{ message: string }> => {
  const response = await api.patch(`/auth/users/${userId}`, data);
  return response.data;
};

export const submitSelectedGrade = async (gradeId: number): Promise<{ message: string }> => {
  const response = await api.post(`/auth/grades/select/${gradeId}`);
  return response.data;
};

export const fetchAdminGradeSelection = async (): Promise<{ data:Grade }> => {
  const response = await api.get('/auth/grade/selected');
  return response.data;
}
