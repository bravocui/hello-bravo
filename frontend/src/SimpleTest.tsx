import React from 'react';

const SimpleTest: React.FC = () => {
  console.log('SimpleTest component rendering');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React App Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Check the browser console for debug messages.</p>
      <button 
        onClick={() => alert('JavaScript is working!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test JavaScript
      </button>
    </div>
  );
};

export default SimpleTest; 