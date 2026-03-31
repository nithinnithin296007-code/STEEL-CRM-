import { Search, X } from 'lucide-react';
import { useState } from 'react';
import '../styles/SearchFilter.css';

export default function SearchFilter({ onFilter, filterOptions = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilter({ searchTerm: value, ...filters });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter({ searchTerm, ...newFilters });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    onFilter({ searchTerm: '', ...{} });
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length + (searchTerm ? 1 : 0);

  return (
    <div className="search-filter-container">
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              onFilter({ searchTerm: '', ...filters });
            }}
            className="clear-btn"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="filter-toggle-btn"
      >
        🔽 {isExpanded ? 'Hide' : 'Filter'}
        {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
      </button>

      {isExpanded && (
        <div className="filter-panel">
          <div className="filter-grid">
            {filterOptions.status && (
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All</option>
                  {filterOptions.status.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.priority && (
              <div className="filter-group">
                <label>Priority</label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">All</option>
                  {filterOptions.priority.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.dateFrom && (
              <div className="filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
            )}

            {filterOptions.dateTo && (
              <div className="filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            )}

            {filterOptions.sortBy && (
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={filters.sortBy || ''}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="">Default</option>
                  {filterOptions.sortBy.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="clear-all-btn">
              ✕ Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}