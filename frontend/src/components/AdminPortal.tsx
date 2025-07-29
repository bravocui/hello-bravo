import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, User as UserIcon, Shield, Eye, CreditCard, Tag } from 'lucide-react';
import Header from './Header';
import api from '../config/api';

interface User {
  id: number;
  email: string;
  name: string;
  picture_url: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface CreditCardData {
  id: number;
  user_id: number;
  name: string;
  owner: string;
  opening_time: string;
  created_at: string;
  updated_at: string;
}

interface SpendingCategory {
  id: number;
  category_name: string;
  created_at: string;
  updated_at: string;
}

interface CreateUserForm {
  email: string;
  name: string;
  role: string;
}

interface EditUserForm {
  name: string;
  role: string;
}

interface CreateCreditCardForm {
  name: string;
  owner: string;
  opening_time: string;
}

interface EditCreditCardForm {
  name: string;
  owner: string;
  opening_time: string;
}

interface CreateSpendingCategoryForm {
  category_name: string;
}

interface EditSpendingCategoryForm {
  category_name: string;
}

const AdminPortal: React.FC = () => {
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    email: '',
    name: '',
    role: 'REGULAR'
  });
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    name: '',
    role: 'REGULAR'
  });

  // Credit Cards state
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([]);
  const [creditCardsLoading, setCreditCardsLoading] = useState(true);
  const [showCreateCreditCardForm, setShowCreateCreditCardForm] = useState(false);
  const [editingCreditCard, setEditingCreditCard] = useState<number | null>(null);
  const [createCreditCardForm, setCreateCreditCardForm] = useState<CreateCreditCardForm>({
    name: '',
    owner: '',
    opening_time: new Date().toISOString().slice(0, 10)
  });
  const [editCreditCardForm, setEditCreditCardForm] = useState<EditCreditCardForm>({
    name: '',
    owner: '',
    opening_time: ''
  });

  // Spending Categories state
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const [spendingCategoriesLoading, setSpendingCategoriesLoading] = useState(true);
  const [showCreateSpendingCategoryForm, setShowCreateSpendingCategoryForm] = useState(false);
  const [editingSpendingCategory, setEditingSpendingCategory] = useState<number | null>(null);
  const [createSpendingCategoryForm, setCreateSpendingCategoryForm] = useState<CreateSpendingCategoryForm>({
    category_name: ''
  });
  const [editSpendingCategoryForm, setEditSpendingCategoryForm] = useState<EditSpendingCategoryForm>({
    category_name: ''
  });

  // General state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchCreditCards();
    fetchSpendingCategories();
  }, []);

  // Users API functions
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/users/admin/list');
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/admin/create', createUserForm);
      setUsers([response.data, ...users]);
      setCreateUserForm({ email: '', name: '', role: 'REGULAR' });
      setShowCreateUserForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: number) => {
    try {
      setUpdatingUser(userId);
      const response = await api.put(`/users/admin/${userId}`, editUserForm);
      setUsers(users.map(user => 
        user.id === userId ? response.data : user
      ));
      setEditingUser(null);
      setError(null);
      setSuccessMessage(`User "${response.data.name}" updated successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
      setSuccessMessage(null);
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await api.delete(`/users/admin/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete user';
      
      // Check if it's a related data error
      if (errorMessage.includes('Cannot delete user. User has:')) {
        // Show a more prominent warning
        if (window.confirm(`${errorMessage}\n\nThis user cannot be deleted because they have associated data. Please remove all their data first before deleting the user account.`)) {
          // User acknowledged the warning
          setError(null);
        } else {
          // User cancelled
          setError(null);
        }
      } else {
        setError(errorMessage);
      }
    }
  };

  // Credit Cards API functions
  const fetchCreditCards = async () => {
    try {
      setCreditCardsLoading(true);
      const response = await api.get('/credit-cards/');
      setCreditCards(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch credit cards');
    } finally {
      setCreditCardsLoading(false);
    }
  };

  const handleCreateCreditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/credit-cards/', createCreditCardForm);
      setCreditCards([response.data, ...creditCards]);
      setCreateCreditCardForm({ name: '', owner: '', opening_time: new Date().toISOString().slice(0, 10) });
      setShowCreateCreditCardForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create credit card');
    }
  };

  const handleUpdateCreditCard = async (cardId: number) => {
    try {
      const response = await api.put(`/credit-cards/${cardId}`, editCreditCardForm);
      setCreditCards(creditCards.map(card => 
        card.id === cardId ? response.data : card
      ));
      setEditingCreditCard(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update credit card');
    }
  };

  const handleDeleteCreditCard = async (cardId: number) => {
    if (!window.confirm('Are you sure you want to delete this credit card?')) {
      return;
    }
    
    try {
      await api.delete(`/credit-cards/${cardId}`);
      setCreditCards(creditCards.filter(card => card.id !== cardId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete credit card');
    }
  };

  // Spending Categories API functions
  const fetchSpendingCategories = async () => {
    try {
      setSpendingCategoriesLoading(true);
      const response = await api.get('/spending-categories/');
      setSpendingCategories(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch spending categories');
    } finally {
      setSpendingCategoriesLoading(false);
    }
  };

  const handleCreateSpendingCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/spending-categories/', createSpendingCategoryForm);
      setSpendingCategories([response.data, ...spendingCategories]);
      setCreateSpendingCategoryForm({ category_name: '' });
      setShowCreateSpendingCategoryForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create spending category');
    }
  };

  const handleUpdateSpendingCategory = async (categoryId: number) => {
    try {
      const response = await api.put(`/spending-categories/${categoryId}`, editSpendingCategoryForm);
      setSpendingCategories(spendingCategories.map(category => 
        category.id === categoryId ? response.data : category
      ));
      setEditingSpendingCategory(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update spending category');
    }
  };

  const handleDeleteSpendingCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this spending category?')) {
      return;
    }
    
    try {
      await api.delete(`/spending-categories/${categoryId}`);
      setSpendingCategories(spendingCategories.filter(category => category.id !== categoryId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete spending category');
    }
  };

  // Helper functions
  const startEditingUser = (user: User) => {
    setEditingUser(user.id);
    setEditUserForm({
      name: user.name,
      role: user.role
    });
  };

  const cancelEditingUser = () => {
    setEditingUser(null);
    setEditUserForm({ name: '', role: 'REGULAR' });
  };

  const startEditingCreditCard = (card: CreditCardData) => {
    setEditingCreditCard(card.id);
    setEditCreditCardForm({
      name: card.name,
      owner: card.owner,
      opening_time: new Date(card.opening_time).toISOString().slice(0, 10)
    });
  };

  const cancelEditingCreditCard = () => {
    setEditingCreditCard(null);
    setEditCreditCardForm({ name: '', owner: '', opening_time: '' });
  };

  const startEditingSpendingCategory = (category: SpendingCategory) => {
    setEditingSpendingCategory(category.id);
    setEditSpendingCategoryForm({
      category_name: category.category_name
    });
  };

  const cancelEditingSpendingCategory = () => {
    setEditingSpendingCategory(null);
    setEditSpendingCategoryForm({ category_name: '' });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'REGULAR':
        return <UserIcon className="w-4 h-4 text-blue-500" />;
      case 'READONLY':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'REGULAR':
        return 'bg-blue-100 text-blue-800';
      case 'READONLY':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  if (usersLoading || creditCardsLoading || spendingCategoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          title="Admin Portal" 
          icon={UserIcon} 
          iconColor="blue"
          showBackButton
          showUserInfo
          showLogout
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Admin Portal" 
        icon={UserIcon} 
        iconColor="blue"
        showBackButton
        showUserInfo
        showLogout
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="text-green-800">{successMessage}</div>
            </div>
          </div>
        )}

        {/* Users Block */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <button
              onClick={() => setShowCreateUserForm(true)}
              className="flex items-center bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Create User Form */}
          {showCreateUserForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={createUserForm.name}
                    onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="ADMIN">Admin</option>
                    <option value="READONLY">Read Only</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateUserForm(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.picture_url ? (
                        <img className="h-10 w-10 rounded-full" src={user.picture_url} alt={user.name} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          value={editUserForm.name}
                          onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          value={editUserForm.role}
                          onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="REGULAR">Regular</option>
                          <option value="ADMIN">Admin</option>
                          <option value="READONLY">Read Only</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateUser(user.id)}
                            disabled={updatingUser === user.id}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                              updatingUser === user.id 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                          >
                            {updatingUser === user.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEditingUser}
                            disabled={updatingUser === user.id}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                              updatingUser === user.id 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gray-600 hover:bg-gray-700'
                            } text-white`}
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditingUser(user)}
                            className="flex items-center px-2 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Cards and Spending Categories Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Credit Cards Block */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Credit Cards</h2>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <button
                onClick={() => setShowCreateCreditCardForm(true)}
                className="flex items-center bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Create Credit Card Form */}
            {showCreateCreditCardForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <form onSubmit={handleCreateCreditCard} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Card Name"
                      value={createCreditCardForm.name}
                      onChange={(e) => setCreateCreditCardForm({...createCreditCardForm, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <select
                      value={createCreditCardForm.owner}
                      onChange={(e) => setCreateCreditCardForm({...createCreditCardForm, owner: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Owner</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={createCreditCardForm.opening_time}
                      onChange={(e) => setCreateCreditCardForm({...createCreditCardForm, opening_time: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateCreditCardForm(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Credit Cards Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCreditCard === card.id ? (
                          <input
                            type="text"
                            value={editCreditCardForm.name}
                            onChange={(e) => setEditCreditCardForm({...editCreditCardForm, name: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{card.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCreditCard === card.id ? (
                          <select
                            value={editCreditCardForm.owner}
                            onChange={(e) => setEditCreditCardForm({...editCreditCardForm, owner: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Owner</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.name}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-900">{card.owner}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCreditCard === card.id ? (
                          <input
                            type="date"
                            value={editCreditCardForm.opening_time}
                            onChange={(e) => setEditCreditCardForm({...editCreditCardForm, opening_time: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{formatDate(card.opening_time)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingCreditCard === card.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateCreditCard(card.id)}
                              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEditingCreditCard}
                              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-600 text-white hover:bg-gray-700"
                            >
                              <X className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                                                         <button
                               onClick={() => startEditingCreditCard(card)}
                               className="flex items-center px-2 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                             >
                               <Edit className="w-3 h-3" />
                             </button>
                             <button
                               onClick={() => handleDeleteCreditCard(card.id)}
                               className="flex items-center px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spending Categories Block */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Spending Categories</h2>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <button
                onClick={() => setShowCreateSpendingCategoryForm(true)}
                className="flex items-center bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Create Spending Category Form */}
            {showCreateSpendingCategoryForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <form onSubmit={handleCreateSpendingCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={createSpendingCategoryForm.category_name}
                      onChange={(e) => setCreateSpendingCategoryForm({...createSpendingCategoryForm, category_name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateSpendingCategoryForm(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Spending Categories Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {spendingCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingSpendingCategory === category.id ? (
                          <input
                            type="text"
                            value={editSpendingCategoryForm.category_name}
                            onChange={(e) => setEditSpendingCategoryForm({...editSpendingCategoryForm, category_name: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{category.category_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingSpendingCategory === category.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateSpendingCategory(category.id)}
                              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEditingSpendingCategory}
                              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-600 text-white hover:bg-gray-700"
                            >
                              <X className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                                                         <button
                               onClick={() => startEditingSpendingCategory(category)}
                               className="flex items-center px-2 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                             >
                               <Edit className="w-3 h-3" />
                             </button>
                             <button
                               onClick={() => handleDeleteSpendingCategory(category.id)}
                               className="flex items-center px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal; 