import React from 'react';

const Loading = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading loading-spinner loading-lg" style={{ color: '#667eea' }}></div>
        <p style={{ marginTop: '16px', color: '#636e72', fontSize: '14px', fontWeight: '600' }}>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
