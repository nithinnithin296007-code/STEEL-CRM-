import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

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
    onFilter({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <div style={{ marginBottom: 20 }}>

      {/* Search + Filter in one row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>

        {/* Search input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 11, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '8px 36px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
              background: 'var(--bg)',
              color: 'var(--text)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); onFilter({ searchTerm: '', ...filters }); }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter button */}
        {Object.keys(filterOptions).length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, fontSize: 13,
              fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              border: isExpanded ? '1px solid #2563eb' : '1px solid var(--border)',
              background: isExpanded ? '#eff6ff' : 'var(--bg)',
              color: isExpanded ? '#2563eb' : 'var(--text-secondary)',
              fontFamily: 'inherit'
            }}
          >
            <SlidersHorizontal size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span style={{
                background: '#2563eb', color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 11, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700
              }}>{activeFilterCount}</span>
            )}
          </button>
        )}
      </div>

      {/* Filter panel */}
      {isExpanded && (
        <div style={{
          marginTop: 10, padding: '16px', background: 'var(--bg)',
          borderRadius: 8, border: '1px solid var(--border)',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end'
        }}>
          {filterOptions.status && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
              <select value={filters.status || ''} onChange={e => handleFilterChange('status', e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--white)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">All</option>
                {filterOptions.status.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {filterOptions.priority && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
              <select value={filters.priority || ''} onChange={e => handleFilterChange('priority', e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--white)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">All</option>
                {filterOptions.priority.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {filterOptions.dateFrom && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</div>
              <input type="date" value={filters.dateFrom || ''} onChange={e => handleFilterChange('dateFrom', e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--white)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          )}

          {filterOptions.dateTo && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</div>
              <input type="date" value={filters.dateTo || ''} onChange={e => handleFilterChange('dateTo', e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--white)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          )}

          {filterOptions.sortBy && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort</div>
              <select value={filters.sortBy || ''} onChange={e => handleFilterChange('sortBy', e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--white)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">Default</option>
                {filterOptions.sortBy.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {(activeFilterCount > 0 || searchTerm) && (
            <button onClick={clearFilters} style={{
              padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 7,
              fontSize: 13, cursor: 'pointer', background: 'var(--white)',
              color: 'var(--danger)', fontWeight: 500, fontFamily: 'inherit'
            }}>
              ✕ Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}