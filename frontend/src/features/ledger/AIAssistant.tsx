import React, { useState, useRef, useEffect } from 'react';
import { Bot, Upload, X, Save, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../config/api';

interface ExpenseEntry {
  category: string;
  amount: number;
  notes?: string;
}

interface AIAssistantResponse {
  year?: number;
  month?: number;
  entries: ExpenseEntry[];
  raw_response: string;
}

interface AIAssistantProps {
  onConfirmEntries: (entries: ExpenseEntry[], selectedUser?: string, selectedCreditCard?: string, year?: number, month?: number) => Promise<number>;
  onClose: () => void;
  currentUser?: string;
  currentCreditCard?: string;
  users: Array<{id: number, name: string, email: string}>;
  creditCards: Array<{id: number, name: string, user_id: number, user?: {name: string}}>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onConfirmEntries, onClose, currentUser, currentCreditCard = '', users, creditCards }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIAssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingEntries, setEditingEntries] = useState<ExpenseEntry[]>([]);
  const [editingYear, setEditingYear] = useState<number>(new Date().getFullYear());
  const [editingMonth, setEditingMonth] = useState<number>(new Date().getMonth() + 1);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(currentUser || '');
  const [selectedCreditCard, setSelectedCreditCard] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdEntriesCount, setCreatedEntriesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update selected user when entering edit mode
  useEffect(() => {
    if (isEditing && currentUser) {
      setSelectedUser(currentUser);
    }
  }, [isEditing, currentUser]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      setImage(imageFile);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      setImage(imageFile);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && !image) {
      setError('Please provide either text or an image to process');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAiResponse(null);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      
      if (image) {
        formData.append('images', image);
      }

      const response = await api.post('/ai-assistant/process-expense', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data: AIAssistantResponse = response.data;
      setAiResponse(data);
      
      if (data.entries.length > 0) {
        setEditingEntries(data.entries);
        setEditingYear(data.year || new Date().getFullYear());
        setEditingMonth(data.month || new Date().getMonth() + 1);
        setIsEditing(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditEntry = (index: number, field: keyof ExpenseEntry, value: any) => {
    setEditingEntries(prev => 
      prev.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEntry = (index: number) => {
    setEditingEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmEntries = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const createdCount = await onConfirmEntries(editingEntries, selectedUser, selectedCreditCard, editingYear, editingMonth);
      setCreatedEntriesCount(createdCount);
      setShowSuccessPopup(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to add entries');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation function
  const isFormValid = () => {
    if (editingEntries.length === 0) return false;
    
    return (
      editingYear &&
      editingMonth &&
      selectedUser &&
      selectedCreditCard
    );
  };

  // Add paste event listener to the document
  useEffect(() => {
    const handleDocumentPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              setImage(file);
            }
          }
        }
      }
    };

    document.addEventListener('paste', handleDocumentPaste);
    return () => {
      document.removeEventListener('paste', handleDocumentPaste);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return '🍽️';
    if (categoryLower.includes('transport')) return '🚗';
    if (categoryLower.includes('entertainment')) return '🎬';
    if (categoryLower.includes('shopping')) return '🛍️';
    if (categoryLower.includes('bills')) return '📄';
    return '💳';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Expense Assistant</h2>
              <p className="text-sm text-gray-600">Upload an image or paste text to automatically extract expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Input Section */}
          {!isEditing && (
            <div className="space-y-6">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your expenses or paste credit card statement text
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Paste your credit card statement text here, or describe the expenses you want to add..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload an image (receipt, statement, etc.)
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choose Image</span>
                    </button>
                    <div className="text-sm text-gray-500">
                      <p>Or drag and drop an image here</p>
                      <p>Or paste an image from clipboard (Ctrl+V / Cmd+V)</p>
                      <p className="text-xs mt-1">Supports JPG, PNG, GIF up to 10MB each</p>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {image && (
                  <div className="mt-4">
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Uploaded"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || (!prompt.trim() && !image)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      <span>Process with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {aiResponse && !isEditing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                {aiResponse.entries.length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-medium">
                  {aiResponse.entries.length > 0 
                    ? `Found ${aiResponse.entries.length} expense(s)` 
                    : 'No expenses found'
                  }
                </span>

              </div>

              {aiResponse.entries.length === 0 && (
                <div className="text-sm text-gray-600">
                  <p>AI couldn't extract any expenses from the provided information.</p>
                  <p className="mt-2">Raw AI response:</p>
                  <pre className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs overflow-x-auto">
                    {aiResponse.raw_response}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Editing Section */}
          {isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Review & Confirm Expenses</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back to Input
                  </button>
                </div>
              </div>

                            {/* Header Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Credit Card <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCreditCard}
                      onChange={(e) => setSelectedCreditCard(e.target.value)}
                      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        !selectedCreditCard ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Credit Card</option>
                      {creditCards.map(card => (
                        <option key={card.id} value={card.name}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={editingYear}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        setEditingYear(year);
                      }}
                      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        !editingYear ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingMonth}
                      onChange={(e) => {
                        const month = parseInt(e.target.value);
                        setEditingMonth(month);
                      }}
                      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        !editingMonth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {[
                        { value: 1, label: 'Jan' },
                        { value: 2, label: 'Feb' },
                        { value: 3, label: 'Mar' },
                        { value: 4, label: 'Apr' },
                        { value: 5, label: 'May' },
                        { value: 6, label: 'Jun' },
                        { value: 7, label: 'Jul' },
                        { value: 8, label: 'Aug' },
                        { value: 9, label: 'Sep' },
                        { value: 10, label: 'Oct' },
                        { value: 11, label: 'Nov' },
                        { value: 12, label: 'Dec' }
                      ].map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

                            {/* Expenses Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">Expense Categories</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {editingEntries.map((entry, index) => (
                    <div key={index} className="px-3 py-2 flex items-center space-x-3">
                      {/* Category Column */}
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-lg flex-shrink-0">{getCategoryIcon(entry.category)}</span>
                        <input
                          type="text"
                          value={entry.category}
                          onChange={(e) => handleEditEntry(index, 'category', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Amount Column */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <input
                          type="number"
                          step="0.01"
                          value={entry.amount}
                          onChange={(e) => handleEditEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeEntry(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Notes Column */}
                      <div className="flex-1 min-w-0">
                        <textarea
                          value={entry.notes || ''}
                          onChange={(e) => handleEditEntry(index, 'notes', e.target.value)}
                          placeholder="Notes explaining calculation..."
                          rows={Math.max(1, Math.ceil((entry.notes || '').length / 50))}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                {/* Total Amount */}
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex justify-between items-center">
      <span className="text-lg font-medium text-gray-900">Total Amount:</span>
      <span className="text-2xl font-bold text-blue-600">
        {formatCurrency(editingEntries.reduce((sum, entry) => sum + entry.amount, 0))}
      </span>
    </div>
  </div>

  {/* Error Display */}
  {submitError && (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-red-700">{submitError}</span>
      </div>
    </div>
  )}

  {/* Action Buttons */}
  <div className="flex justify-between items-center pt-2">
    <div className="text-sm text-gray-600">
      {editingEntries.length} expense(s) ready to add
    </div>
    <div className="flex space-x-3">
      <button
        onClick={() => setIsEditing(false)}
        disabled={isSubmitting}
        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirmEntries}
        disabled={!isFormValid() || isSubmitting}
        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Adding...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Add {editingEntries.length} Expense(s)</span>
          </>
        )}
      </button>
    </div>
  </div>

  {/* Debug Info Toggle */}
  <div className="mt-4 pt-4 border-t border-gray-200">
    <button
      onClick={() => setShowDebugInfo(!showDebugInfo)}
      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
    >
      <span>{showDebugInfo ? 'Hide' : 'Show'} Debug Info</span>
      <svg
        className={`w-4 h-4 transition-transform ${showDebugInfo ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  {/* Debug Information */}
  {showDebugInfo && aiResponse && (
    <div className="mt-4 space-y-4">
      {/* Model Configuration */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Model Configuration</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Model:</strong> gemini-pro-vision</div>
          <div><strong>API:</strong> Google Generative AI</div>
          <div><strong>Max Tokens:</strong> 4096</div>
          <div><strong>Temperature:</strong> 0.1</div>
          <div><strong>Categories:</strong> {aiResponse.entries.length > 0 ? 'Database-driven' : 'Default'}</div>
        </div>
      </div>



      {/* Raw Model Response */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Model Response</h4>
        <div className="text-xs text-gray-600 bg-white p-3 rounded border max-h-40 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{aiResponse.raw_response}</pre>
        </div>
      </div>
    </div>
  )}
</div>
)}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Items Added Successfully
              </h3>
              <p className="text-gray-600 mb-6">
                {createdEntriesCount} expense {createdEntriesCount === 1 ? 'entry' : 'entries'} {createdEntriesCount === 1 ? 'has' : 'have'} been added to your ledger.
              </p>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant; 