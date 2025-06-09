import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      <button
        className={`tab-button ${activeTab === 'personel' ? 'active' : ''}`}
        onClick={() => setActiveTab('personel')}
      >
        Personel Yönetimi
      </button>
      <button
        className={`tab-button ${activeTab === 'tayinTalepleri' ? 'active' : ''}`}
        onClick={() => setActiveTab('tayinTalepleri')}
      >
        Tayin Talepleri Yönetimi
      </button>
      <button
        className={`tab-button ${activeTab === 'loglar' ? 'active' : ''}`}
        onClick={() => setActiveTab('loglar')}
      >
        Sistem Logları
      </button>
    </div>
  );
};

export default TabNavigation; 