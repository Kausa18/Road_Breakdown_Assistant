import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapDisplay from './components/MapDisplay';
import RequestList from './components/RequestList';
import ProviderDashboard from './components/ProviderDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import RequireAuth from './components/RequireAuth';

const UserDashboard = () => (
  <>
    <div style={{ height: '60vh', width: '100%' }}>
      <MapDisplay />
    </div>
    <div style={{ height: '40vh', overflowY: 'auto', padding: '1rem' }}>
      <RequestList />
    </div>
  </>
);

function App() {
  const [view, setView] = useState('user');

  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <div style={{ padding: '1rem' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>
            Home
          </Link>
          <Link to="/signup" style={{ marginRight: '1rem' }}>
            Signup
          </Link>
          <Link to="/login">Login</Link>
        </div>

        <Routes>
          {/* Public Landing View */}
          <Route
            path="/"
            element={
              <div>
                <div style={{ padding: '1rem' }}>
                  <button onClick={() => setView('user')}>User View</button>
                  <button onClick={() => setView('provider')} style={{ marginLeft: '1rem' }}>
                    Provider View
                  </button>
                </div>

                {view === 'user' ? (
                  <UserDashboard />
                ) : (
                  <ProviderDashboard />
                )}
              </div>
            }
          />

          {/* Signup Page */}
          <Route path="/signup" element={<Signup />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboards */}
          <Route
            path="/user/dashboard"
            element={
              <RequireAuth role="user">
                <UserDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/provider/dashboard"
            element={
              <RequireAuth role="provider">
                <ProviderDashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
