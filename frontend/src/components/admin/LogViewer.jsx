import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api';
import './LogViewer.css';

const LogViewer = () => {
  const token = localStorage.getItem('token');
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [isTypingSearch, setIsTypingSearch] = useState(true);
  const [delayedFilter, setDelayedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [allLogs, setAllLogs] = useState([]);
  
  const fetchLogFile = useCallback(async (filename, page = 1) => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/logs/${filename}`);
      setAllLogs(response.data.logs);
      setCurrentPage(1);
      setPagination({
        total: response.data.logs.length,
        page: 1,
        pages: Math.ceil(response.data.logs.length / logsPerPage)
      });
      setError(null);
    } catch (err) {
      setError('Log dosyası alınamadı: ' + (err.response?.data?.message || err.message));
      setAllLogs([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [logsPerPage]);

  useEffect(() => {
    const filteredData = allLogs.filter(log => {
      const searchTerm = isTypingSearch ? filter : delayedFilter;
      const messageMatch = log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase());
      const levelMatch = !levelFilter || (log.level && log.level === levelFilter);
      return messageMatch && levelMatch;
    });

    setLogs(filteredData);
    
    setPagination(prev => ({
      ...prev,
      total: filteredData.length,
      pages: Math.ceil(filteredData.length / logsPerPage) || 1
    }));
    
    if (currentPage > Math.ceil(filteredData.length / logsPerPage) && filteredData.length > 0) {
      setCurrentPage(1);
    }
  }, [allLogs, filter, levelFilter, delayedFilter, isTypingSearch, logsPerPage, currentPage]);

  useEffect(() => {
    const fetchLogFiles = async () => {
      setLoading(true);
      try {
        const response = await API.get('/admin/logs');
        setLogFiles(response.data.files);
        
        if (response.data.files.length > 0) {
          const todayLog = response.data.files.find(file => 
            file.date === new Date().toISOString().split('T')[0]
          );
          if (todayLog) {
            setSelectedFile(todayLog);
            fetchLogFile(todayLog.filename);
          } else {
            setSelectedFile(response.data.files[0]);
            fetchLogFile(response.data.files[0].filename);
          }
        }
      } catch (err) {
        setError('Log dosyaları alınamadı: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLogFiles();
    } else {
      setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    }
  }, [token, fetchLogFile]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    fetchLogFile(file.filename);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    
    if (isTypingSearch) {
      setDelayedFilter('');
    }
    setCurrentPage(1);
  };
  
  const handleLevelFilterChange = (e) => {
    setLevelFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSearch = () => {
    setDelayedFilter(filter);
    setCurrentPage(1);
  };
  
  const toggleRealtimeSearch = () => {
    const newIsTypingSearch = !isTypingSearch;
    setIsTypingSearch(newIsTypingSearch);
    
    if (newIsTypingSearch) {
      setDelayedFilter('');
    }
  };
  
  const resetFilters = () => {
    setFilter('');
    setLevelFilter('');
    setDelayedFilter('');
    setCurrentPage(1);
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  const nextPage = () => {
    if (currentPage < pagination.pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getLogLevelClass = (level) => {
    switch (level) {
      case 'ERROR': return 'log-error';
      case 'WARN': return 'log-warn';
      case 'INFO': return 'log-info';
      case 'DEBUG': return 'log-debug';
      default: return '';
    }
  };

  if (!token) {
    return <div className="log-viewer"><p className="error">Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.</p></div>;
  }

  return (
    <div className="log-viewer">
      <h2>Sistem Logları</h2>
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group search-group">
            <label htmlFor="message-filter">Mesaj İçeriği:</label>
            <div className="search-input-container">
              <input 
                id="message-filter"
                type="text" 
                placeholder="Mesaj içeriğine göre filtrele..." 
                value={filter}
                onChange={handleFilterChange}
                className="log-filter-input"
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label htmlFor="level-filter">Log Seviyesi:</label>
            <select 
              id="level-filter"
              value={levelFilter} 
              onChange={handleLevelFilterChange}
              className="log-level-filter"
            >
              <option value="">Tüm Seviyeler</option>
              <option value="ERROR">Hata</option>
              <option value="WARN">Uyarı</option>
              <option value="INFO">Bilgi</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>
        </div>
        
        <div className="buttons-row">
          <div className="buttons-container">
            <button onClick={handleSearch} className="btn search-btn">ARA</button>
            <button onClick={resetFilters} className="btn btn-secondary">Filtreleri Temizle</button>
          </div>
        </div>
        
        <div className="search-options-row">
          <div className="search-options-container">
            <div className="search-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isTypingSearch} 
                  onChange={toggleRealtimeSearch} 
                />
                <span>Yazdıkça ara</span>
              </label>
            </div>
            
            <div className="filter-info">
              {logs.length} log kaydı listeleniyor (toplam {allLogs.length})
            </div>
          </div>
        </div>
      </div>
      
      <div className="log-container">
        <div className="log-files-list">
          <h3>Log Dosyaları</h3>
          {loading && !logs.length ? <p>Yükleniyor...</p> : null}
          {error && !logs.length ? <p className="error">{error}</p> : null}
          <ul>
            {logFiles.map((file) => (
              <li 
                key={file.filename}
                className={selectedFile?.filename === file.filename ? 'selected' : ''}
                onClick={() => handleFileSelect(file)}
              >
                {file.date}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="log-content">
          <h3>
            {selectedFile ? `Log İçeriği: ${selectedFile.date}` : 'Log Seçiniz'}
          </h3>
          
          {loading && logs.length ? <p>Yükleniyor...</p> : null}
          {error && logs.length ? <p className="error">{error}</p> : null}
          
          {!loading && logs.length === 0 && <p>Bu kriterlere uygun log kaydı bulunamadı.</p>}
          
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Seviye</th>
                  <th>Mesaj</th>
                  <th>Kullanıcı</th>
                  <th>Detaylar</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr key={indexOfFirstLog + index} className={getLogLevelClass(log.level)}>
                    <td>{log.timestamp}</td>
                    <td>{log.level}</td>
                    <td>{log.message}</td>
                    <td>{log.userId || '-'}</td>
                    <td>
                      {log.error ? (
                        <details>
                          <summary>Hata Detayları</summary>
                          <pre>{JSON.stringify(log.error, null, 2)}</pre>
                        </details>
                      ) : Object.keys(log).filter(key => 
                          !['timestamp', 'level', 'message', 'userId'].includes(key)
                        ).length > 0 ? (
                        <details>
                          <summary>Detaylar</summary>
                          <pre>{JSON.stringify(
                            Object.fromEntries(
                              Object.entries(log).filter(([key]) => 
                                !['timestamp', 'level', 'message', 'userId'].includes(key)
                              )
                            ), 
                            null, 2
                          )}</pre>
                        </details>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {logs.length > 0 && (
            <div className="pagination">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="pagination-button"
              >
                &laquo; Önceki
              </button>
              
              <div className="pagination-info">
                Sayfa {currentPage} / {pagination.pages} (Toplam {pagination.total} kayıt)
              </div>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === pagination.pages}
                className="pagination-button"
              >
                Sonraki &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer; 