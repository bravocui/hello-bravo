// Version configuration
// This file reads the version from package.json and makes it available throughout the app

// Import package.json to get the version
import packageJson from '../../package.json';

// Export the version
export const APP_VERSION = packageJson.version;

// Export a formatted version string
export const getVersionString = () => `v${APP_VERSION}`;

// Export version info for debugging
export const getVersionInfo = () => ({
  version: APP_VERSION,
  name: packageJson.name
}); 