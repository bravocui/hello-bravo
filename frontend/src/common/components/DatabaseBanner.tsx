import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DatabaseBannerProps {
  databaseAvailable: boolean;
}

const DatabaseBanner: React.FC<DatabaseBannerProps> = ({ databaseAvailable }) => {
  if (databaseAvailable) {
    return null; // Don't show banner if database is available
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-center space-x-2">
      <AlertTriangle className="w-5 h-5" />
      <span className="font-medium">
        Database Connection Failed - Using Simplified Mode
      </span>
    </div>
  );
};

export default DatabaseBanner; 