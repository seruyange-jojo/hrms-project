import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, MoreVertical } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import Button from './Button';

// Table Component
export const Table = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  striped = true,
  hover = true,
  compact = false,
  sortable = true,
  searchable = false,
  filterable = false,
  pagination = false,
  pageSize = 10,
  onRowClick,
  rowClassName = '',
  actions = []
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Filtering logic
  const filteredData = useMemo(() => {
    let filtered = sortedData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const rowValue = row[key];
          if (rowValue == null) return false;
          return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    return filtered;
  }, [sortedData, searchTerm, filters, columns]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const baseTableClasses = `table w-full ${striped ? 'table-zebra' : ''} ${compact ? 'table-compact' : ''}`;
  const tableClasses = `${baseTableClasses} ${className}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
          )}

          {filterable && (
            <div className="flex gap-2">
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <select
                    key={column.key}
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    className="select select-bordered select-sm"
                  >
                    <option value="">All {column.header}</option>
                    {[...new Set(data.map(row => row[column.key]))]
                      .filter(Boolean)
                      .map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))
                    }
                  </select>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg border border-base-300">
        <table className={tableClasses}>
          <thead>
            <tr className="bg-base-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-base-300 transition-colors' : ''} 
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortable && column.sortable !== false && sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && <th className="text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`${hover ? 'hover:bg-base-200' : ''} 
                    ${onRowClick ? 'cursor-pointer' : ''} 
                    ${typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName}
                    transition-colors duration-150`}
                  onClick={() => onRowClick && onRowClick(row, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    >
                      {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="text-center">
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-sm">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                          {actions.map((action, actionIndex) => (
                            <li key={actionIndex}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row, index);
                                }}
                                className={`flex items-center gap-2 ${action.className || ''}`}
                                disabled={action.disabled && action.disabled(row)}
                              >
                                {action.icon && <action.icon className="w-4 h-4" />}
                                {action.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="join">
            <Button
              variant="outline"
              size="small"
              className="join-item"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isVisible = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!isVisible) {
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="join-item btn btn-disabled">...</span>;
                }
                return null;
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="small"
                  className="join-item"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="small"
              className="join-item"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;