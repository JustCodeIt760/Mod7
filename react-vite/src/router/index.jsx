import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import SignupFormPage from '../components/SignupFormPage';
import LoginFormPage from '../components/LoginFormPage';
import HomePage from '../components/HomePage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginFormPage />,
      },
      {
        path: 'signup',
        element: <SignupFormPage />,
      },
    ],
  },
]);
