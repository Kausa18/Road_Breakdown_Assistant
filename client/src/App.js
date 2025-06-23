import React, { useState } from 'react';
import MapDisplay from './components/MapDisplay';
import RequestList from './components/RequestList';
import ProviderDashboard from './components/ProviderDashboard';

function App() {
  const [view, setView] = useState('user'); // 'user' or 'provider'

  return (
    <div className="App">
      {/* View toggle button */}
      <div style={{ padding: '1rem' }}>
        <button onClick={() => setView('user')}>User View</button>
        <button onClick={() => setView('provider')} style={{ marginLeft: '1rem' }}>
          Provider View
        </button>
      </div>

      {view === 'user' ? (
        <>
          <div style={{ height: '60vh', width: '100%' }}>
            <MapDisplay />
          </div>
          <div style={{ height: '40vh', overflowY: 'auto', padding: '1rem' }}>
            <RequestList />
          </div>
        </>
      ) : (
        <ProviderDashboard />
      )}
    </div>
  );
}

export default App;
