import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatHistoryPage from './pages/ChatHistoryPage';
import TestQuestionsPage from './pages/TestQuestionsPage';
import TestResultsPage from './pages/TestResultsPage';
import Navigation from './components/Navigation';

// Компонент для захисту роутів
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout для сторінок з навігацією
const LayoutWithNav = ({ children }) => {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter basename="/admin_minichat">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/chat-history"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <ChatHistoryPage />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/test-questions"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <TestQuestionsPage />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/test-results"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <TestResultsPage />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;