export const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('food') || categoryLower.includes('dining')) return '🍽️';
  if (categoryLower.includes('transport')) return '🚗';
  if (categoryLower.includes('entertainment')) return '🎬';
  if (categoryLower.includes('shopping')) return '🛍️';
  if (categoryLower.includes('bills')) return '📄';
  return '💳';
};

export const getCategoryColor = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('food') || categoryLower.includes('dining')) return '#10b981'; // teal
  if (categoryLower.includes('transport')) return '#3b82f6'; // blue
  if (categoryLower.includes('entertainment')) return '#f59e0b'; // orange
  if (categoryLower.includes('shopping')) return '#ec4899'; // pink
  if (categoryLower.includes('bills')) return '#8b5cf6'; // purple
  return '#6b7280'; // gray
};

export const getUserCardColor = (userCardKey: string) => {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#EC4899', // pink
    '#6366F1', // indigo
  ];
  
  // Simple hash function to get consistent color for user+card combination
  let hash = 0;
  for (let i = 0; i < userCardKey.length; i++) {
    hash = ((hash << 5) - hash) + userCardKey.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return colors[Math.abs(hash) % colors.length];
}; 