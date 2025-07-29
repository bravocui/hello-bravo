import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getVersionString } from '../config/version';

interface HeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  showBackButton?: boolean;
  showUserInfo?: boolean;
  showLogout?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  icon: Icon,
  iconColor,
  showBackButton = false,
  showUserInfo = false,
  showLogout = false
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:block">Back</span>
            </button>
          )}
          
          {/* Title and Icon */}
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-8 h-8 bg-${iconColor}-100 rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${iconColor}-600`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500">{getVersionString()}</p>
            </div>
          </div>
          
          {/* User Info and Logout */}
          {(showUserInfo || showLogout) && (
            <div className="flex items-center space-x-4">
              {/* Admin Portal Button */}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/user-management')}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Admin Portal"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:block text-sm">Admin Portal</span>
                </button>
              )}
              
              {showUserInfo && user && (
                <div className="flex items-center space-x-2">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                      {user.role && (
                        <span className="text-xs text-gray-400 ml-1 lowercase">
                          {user.role.toLowerCase()}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
              
              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block text-sm">Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 