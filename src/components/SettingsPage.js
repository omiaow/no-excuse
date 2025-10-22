import React from 'react';

function SettingsPage() {
  return (
    <div className="app__page app__page--settings">
      <h1 className="app__page-title">Settings</h1>
      <div className="app__settings-list">
        <div className="app__setting-item">
          <span>Notifications</span>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="app__setting-item">
          <span>Dark Mode</span>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
