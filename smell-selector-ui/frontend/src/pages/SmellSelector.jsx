import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSmells } from '../hooks/useSmells';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { Pagination } from '../components/Pagination/Pagination';
import { CodeViewer } from '../components/CodeViewer/CodeViewer';

function SmellSelector() {
  const {
    smells,
    repositories,
    selectedSmell,
    loading,
    error,
    filters,
    total,
    selectedCount,
    page,
    pageSize,
    totalPages,
    loadSmellDetail,
    selectSmell,
    unselectSmell,
    updateMetadata,
    updateFilters,
    clearFilters,
    setPage,
  } = useSmells();

  const [selectedSmellId, setSelectedSmellId] = useState(null);

  const handleSmellClick = async (smell) => {
    setSelectedSmellId(smell.id);
    await loadSmellDetail(smell.id);
  };

  // Keyboard navigation: Arrow left/right to navigate between smells
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedSmellId ||
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA') {
        return;
      }

      const currentIndex = smells.findIndex(s => s.id === selectedSmellId);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < smells.length - 1) {
          const nextSmell = smells[currentIndex + 1];
          handleSmellClick(nextSmell);
        } else if (page < totalPages) {
          setPage(page + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevSmell = smells[currentIndex - 1];
          handleSmellClick(prevSmell);
        } else if (page > 1) {
          setPage(page - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSmellId, smells, page, totalPages]);

  useEffect(() => {
    if (smells.length > 0 && selectedSmellId) {
      const isInCurrentPage = smells.some(s => s.id === selectedSmellId);
      if (!isInCurrentPage) {
        handleSmellClick(smells[0]);
      }
    }
  }, [smells]);

  return (
    <>
      <FilterBar
        repositories={repositories}
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        total={total}
        selectedCount={selectedCount}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <Link
          to="/refactorings"
          style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', background: '#3b82f6', color: 'white' }}
        >
          View Refactorings →
        </Link>
      </div>

      <div className="content">
        {loading && <div className="loading">Loading smells...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <>
            <div className="smell-list">
              <h2>
                Smells (showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total})
              </h2>
              {smells.length === 0 ? (
                <div className="empty">
                  No smells found. Try running smell detection first:
                  <code>/analyze-smells [repo-name]</code>
                </div>
              ) : (
                <>
                  <div className="smells">
                    {smells.map((smell) => (
                      <div
                        key={smell.id}
                        className={`smell-card ${selectedSmellId === smell.id ? 'selected' : ''}`}
                        onClick={() => handleSmellClick(smell)}
                      >
                        <div className="smell-header">
                          <input
                            type="checkbox"
                            checked={smell.is_selected}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (smell.is_selected) {
                                unselectSmell(smell.id);
                              } else {
                                selectSmell(smell.id);
                              }
                            }}
                          />
                          <span className="smell-type">{smell.smell_type}</span>
                        </div>
                        <div className="smell-file">
                          {smell.file.path}:{JSON.parse(smell.line_numbers)[0]}
                        </div>
                        <div className="smell-meta">
                          <span className={`severity severity-${smell.severity || 'unknown'}`}>
                            {smell.severity || 'N/A'}
                          </span>
                          <span className="tool">{smell.detection_tool}</span>
                          {smell.ui_metadata?.annotations && <span className="has-notes">📝</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>

            <div className="smell-detail">
              {selectedSmell ? (
                <>
                  <h2>
                    Smell Detail
                    <span style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: 'normal',
                      marginLeft: '12px'
                    }}>
                      ← → Navigate
                    </span>
                  </h2>
                  <div className="detail-content">
                    <div className="detail-info">
                      <p><strong>Type:</strong> {selectedSmell.smell_type}</p>
                      <p><strong>File:</strong> {selectedSmell.file.path}</p>
                      <p><strong>Lines:</strong> {selectedSmell.line_numbers}</p>
                      <p><strong>Severity:</strong> {selectedSmell.severity || 'N/A'}</p>
                      <p><strong>Tool:</strong> {selectedSmell.detection_tool}</p>
                      <p><strong>Status:</strong> {selectedSmell.is_selected ? '✓ Selected' : 'Not Selected'}</p>
                    </div>

                    {selectedSmell.code_snippet ? (
                      <CodeViewer
                        lineNumbers={selectedSmell.line_numbers}
                        codeSnippet={selectedSmell.code_snippet}
                        snippetStartLine={selectedSmell.snippet_start_line}
                        snippetEndLine={selectedSmell.snippet_end_line}
                      />
                    ) : (
                      <div className="no-code">
                        No code snippet available
                      </div>
                    )}

                    <div className="metadata-section">
                      <h3>Metadata</h3>
                      <textarea
                        placeholder="Add notes about this smell..."
                        value={selectedSmell.ui_metadata?.annotations || ''}
                        onChange={(e) => {
                          updateMetadata(selectedSmell.id, {
                            annotations: e.target.value
                          });
                        }}
                      />

                      <div className="actions">
                        <button
                          className={selectedSmell.is_selected ? 'btn-danger' : 'btn-primary'}
                          onClick={() => {
                            if (selectedSmell.is_selected) {
                              unselectSmell(selectedSmell.id);
                            } else {
                              selectSmell(selectedSmell.id, {
                                annotations: selectedSmell.ui_metadata?.annotations,
                                priority: selectedSmell.ui_metadata?.priority || 3,
                                tags: selectedSmell.ui_metadata?.tags || []
                              });
                            }
                          }}
                        >
                          {selectedSmell.is_selected ? '✗ Unselect' : '✓ Select for Study'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  Click on a smell to view details
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default SmellSelector;
