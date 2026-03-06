import React, { useState } from 'react';
import { MdCloudUpload, MdDownload, MdFileUpload, MdPreview } from 'react-icons/md';
import { motion } from 'framer-motion';
import Loading from './common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const BulkDataManager = () => {
  const [activeType, setActiveType] = useState('inventory');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importMode, setImportMode] = useState('skip');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const dataTypes = [
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'recipes', label: 'Recipes', icon: '🍳' }
  ];

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`${API_URL}/bulk/template/${activeType}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeType}-template.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading template: ' + error.message);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`${API_URL}/bulk/export/${activeType}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeType}-export.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting data: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview(null);
    setResults(null);
  };

  const previewImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/bulk/preview/${activeType}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      alert('Error previewing file: ' + error.message);
    }
    setLoading(false);
  };

  const importData = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', importMode);
      
      const response = await fetch(`${API_URL}/bulk/import/${activeType}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json();
      setResults(data);
      setPreview(null);
    } catch (error) {
      alert('Error importing data: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      marginTop: window.innerWidth < 768 ? '0px' : '0px',
      padding: window.innerWidth < 768 ? '15px' : '30px',
      background: '#f8f9fa',
      minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdCloudUpload style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Bulk Data Manager
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Import and export data via Excel files</p>}
        </div>
      </div>

      {loading && <Loading />}

      {/* Data Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {dataTypes.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveType(type.id)}
              style={{
                padding: '12px 20px',
                background: activeType === type.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: activeType === type.id ? 'white' : '#2d3436',
                border: activeType === type.id ? 'none' : '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: activeType === type.id ? '0 4px 12px rgba(102,126,234,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {type.icon} {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '20px' }}>
        {/* Left Panel - Actions */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3436', marginBottom: '20px' }}>Actions</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadTemplate}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MdDownload /> Download Template
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportData}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,184,148,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MdDownload /> Export Current Data
            </motion.button>

            <div style={{ height: '1px', background: '#e9ecef', margin: '10px 0' }}></div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', margin: '10px 0' }}>Upload File</p>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{
                padding: '12px',
                border: '2px dashed #667eea',
                borderRadius: '8px',
                background: '#f8f9fa',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#2d3436'
              }}
            />

            {file && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>Import Mode</p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="mode"
                        checked={importMode === 'skip'}
                        onChange={() => setImportMode('skip')}
                        style={{ accentColor: '#667eea' }}
                      />
                      <span style={{ fontSize: '14px', color: '#2d3436' }}>Skip Invalid</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="mode"
                        checked={importMode === 'all'}
                        onChange={() => setImportMode('all')}
                        style={{ accentColor: '#667eea' }}
                      />
                      <span style={{ fontSize: '14px', color: '#2d3436' }}>All or Nothing</span>
                    </label>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={previewImport}
                  disabled={loading}
                  style={{
                    padding: '12px 16px',
                    background: loading ? '#95a5a6' : 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(255,165,2,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <MdPreview /> {loading ? 'Loading...' : 'Preview Import'}
                </motion.button>

                {preview && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={importData}
                    disabled={loading}
                    style={{
                      padding: '12px 16px',
                      background: loading ? '#95a5a6' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(231,76,60,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <MdFileUpload /> {loading ? 'Importing...' : 'Import Data'}
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Results */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3436', marginBottom: '20px' }}>Results</h2>
          
          {preview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{preview.totalRows}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Total Rows</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#00b894' }}>{preview.validRows}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Valid</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#e74c3c' }}>{preview.invalidRows}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Invalid</div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '400px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f1f3f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436', borderBottom: '1px solid #e9ecef' }}>Row</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436', borderBottom: '1px solid #e9ecef' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436', borderBottom: '1px solid #e9ecef' }}>Data</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436', borderBottom: '1px solid #e9ecef' }}>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#2d3436' }}>{row.rowNumber}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '11px',
                            color: row.valid ? '#00b894' : '#e74c3c',
                            background: row.valid ? '#e8f5e9' : '#ffebee',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}>
                            {row.valid ? 'Valid' : 'Invalid'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#636e72', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {JSON.stringify(row.data).substring(0, 50)}...
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#e74c3c' }}>{row.errors.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d3436' }}>{results.totalRows}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Total</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#00b894' }}>{results.created}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Created</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{results.updated}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Updated</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffa502' }}>{results.skipped}</div>
                  <div style={{ fontSize: '12px', color: '#636e72', fontWeight: '500' }}>Skipped</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div style={{ background: '#ffebee', border: '1px solid #e74c3c', borderRadius: '8px', padding: '15px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e74c3c', marginBottom: '10px' }}>Import Errors:</h3>
                  <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: 0 }}>
                    {results.errors.slice(0, 5).map((error, idx) => (
                      <li key={idx} style={{ fontSize: '14px', color: '#2d3436', marginBottom: '5px' }}>
                        Row {error.row}: {error.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!preview && !results && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#636e72' }}>
              <MdCloudUpload style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea' }} />
              <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>No data to display</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Upload a file to see preview and results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkDataManager;