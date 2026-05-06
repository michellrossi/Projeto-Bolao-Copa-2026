import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { LoginPage } from './pages/LoginPage';
import PredictionsPage from './pages/PredictionsPage';
import GroupsPage from './pages/GroupsPage';
import TablePage from './pages/TablePage';
import RankingPage from './pages/RankingPage';
import UsersPage from './pages/UsersPage';
import RulesPage from './pages/RulesPage';
import { AuthProvider } from './hooks/useAuth';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Navigate to="/palpites" /> },
      { path: '/palpites', element: <PredictionsPage /> },
      { path: '/tabela', element: <TablePage /> },
      { path: '/grupos', element: <GroupsPage /> },
      { path: '/ranking', element: <RankingPage /> },
      { path: '/usuarios', element: <UsersPage /> },
      { path: '/regras', element: <RulesPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
