'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  Loader2, 
  Plus, 
  Trash2, 
  Key, 
  Edit2 
} from 'lucide-react';
import {
  fetchAllUsers,
  registerUser,
  resetUserPassword,
  deleteUser,
  updateUser,
  type UserMini,
  type UserRegister,
} from '../components/api/users';

import Toast from '../components/layout/Toast';

// Toast Component

export default function UsersManagement() {
  const [users, setUsers] = useState<UserMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for adding new user
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gradeCode, setGradeCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserMini | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editGradeCode, setEditGradeCode] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  // Reset password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserMini | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload: UserRegister = {
        username,
        password,
        grade_code: gradeCode || null,
        is_admin: isAdmin,
      };

      await registerUser(payload);
      setSuccess('User registered successfully');
      setUsername('');
      setPassword('');
      setGradeCode('');
      setIsAdmin(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register user');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: UserMini) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditGradeCode(user.grade_code || '');
    setEditIsAdmin(user.is_admin);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await updateUser(editingUser.id, {
        username: editUsername !== editingUser.username ? editUsername : undefined,
        grade_code: editGradeCode || null,
        is_admin: editIsAdmin,
      });

      setSuccess('User updated successfully');
      setEditModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await resetUserPassword(resetUser.id, newPassword);
      setSuccess('Password reset successfully');
      setNewPassword('');
      setResetModalOpen(false);
      setResetUser(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserMini) => {
    if (!window.confirm('Are you sure you want to delete this user: ' + user.username + ' ? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await deleteUser(user.id);
      setSuccess('User deleted successfully');
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
            </div>
          </div>

          {/* Add New User Card */}
          <div className="mb-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Add New User
            </h2>

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6" autoComplete='off'>
              <input
                type="text"
                name="username"
                autoComplete="username"
                style={{ position: "absolute", top: "-1000px", left: "-1000px" }}
              />

              <input
                type="password"
                name="password"
                autoComplete="current-password"
                style={{ position: "absolute", top: "-1000px", left: "-1000px" }}
              /> 
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  name="random-username" // to prevent browser autofill
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  name="random-password" // to prevent browser autofill
                  onChange={(e) => setPassword(e.target.value)}
                  required                  
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Code (optional)</label>
                <input
                  type="text"
                  value={gradeCode}
                  onChange={(e) => setGradeCode(e.target.value)}
                  placeholder="e.g. 10A"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                />
              </div> */}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin User</label>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {submitting ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>

          {/* Users List */}
          <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">All Users</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">No users found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <li key={user.id} className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {user.username}
                        </span>

                        {user.is_admin ? (
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            Normal
                          </span>
                        )}
                      </div>

                      {user.grade_code && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Grade: {user.grade_code}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="Edit User"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => {
                          setResetUser(user);
                          setNewPassword('');
                          setResetModalOpen(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition"
                        title="Reset Password"
                      >
                        <Key className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        {editModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                Edit User: <span className="text-blue-600 dark:text-blue-400">{editingUser.username}</span>
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Code</label>
                  <input
                    type="text"
                    value={editGradeCode}
                    onChange={(e) => setEditGradeCode(e.target.value)}
                    placeholder="e.g. 10A (leave empty to clear)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  />
                </div> */}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="editIsAdmin"
                    checked={editIsAdmin}
                    onChange={(e) => setEditIsAdmin(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="editIsAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin User
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetModalOpen && resetUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Reset Password for <span className="text-amber-600 dark:text-amber-400">{resetUser.username}</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter a new password for this user.
              </p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full mb-6 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={submitting || !newPassword}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}