import React from 'react';
import { GitBranch, Clock, Hash } from 'lucide-react';

interface DeploymentStatusProps {
  className?: string;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ className = '' }) => {
  const deploymentMethod = process.env.REACT_APP_DEPLOYMENT_METHOD || 'unknown';
  const deploymentTime = process.env.REACT_APP_DEPLOYMENT_TIME;
  const commitSha = process.env.REACT_APP_COMMIT_SHA;

  const getDeploymentInfo = () => {
    switch (deploymentMethod) {
      case 'github-actions':
        return {
          method: 'GitHub Actions',
          icon: GitBranch,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'manual':
        return {
          method: 'Manual Deploy',
          icon: GitBranch,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          method: 'Unknown',
          icon: GitBranch,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const info = getDeploymentInfo();
  const Icon = info.icon;

  const formatTime = (timestamp: string) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return null;
    }
  };

  const formatCommitSha = (sha: string) => {
    if (!sha) return null;
    return sha.substring(0, 7);
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${info.bgColor} ${info.borderColor} border ${className}`}>
      <Icon className={`w-3 h-3 ${info.color}`} />
      <span className={info.color}>{info.method}</span>
      
      {deploymentTime && (
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatTime(deploymentTime)}</span>
        </div>
      )}
      
      {commitSha && (
        <div className="flex items-center space-x-1 text-gray-500">
          <Hash className="w-3 h-3" />
          <span>{formatCommitSha(commitSha)}</span>
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus; 