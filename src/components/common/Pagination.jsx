import React from 'react';
import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showInfo = true 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      background: 'white',
      borderTop: '1px solid #e9ecef',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {showInfo && (
        <div style={{
          fontSize: '14px',
          color: '#636e72',
          fontWeight: '500'
        }}>
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            background: 'white',
            color: currentPage === 1 ? '#95a5a6' : '#2d3436',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            height: '36px',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.background = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
          }}
        >
          <MdFirstPage />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            background: 'white',
            color: currentPage === 1 ? '#95a5a6' : '#2d3436',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            height: '36px',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.background = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
          }}
        >
          <MdChevronLeft />
        </button>

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span style={{
                padding: '8px 12px',
                color: '#636e72',
                fontSize: '14px'
              }}>
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  background: currentPage === page ? '#667eea' : 'white',
                  color: currentPage === page ? 'white' : '#2d3436',
                  cursor: 'pointer',
                  minWidth: '36px',
                  height: '36px',
                  fontSize: '14px',
                  fontWeight: currentPage === page ? '600' : '500'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) {
                    e.target.style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) {
                    e.target.style.background = 'white';
                  }
                }}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            background: 'white',
            color: currentPage === totalPages ? '#95a5a6' : '#2d3436',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            height: '36px',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.background = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
          }}
        >
          <MdChevronRight />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            background: 'white',
            color: currentPage === totalPages ? '#95a5a6' : '#2d3436',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            height: '36px',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.background = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
          }}
        >
          <MdLastPage />
        </button>
      </div>
    </div>
  );
};

export default Pagination;