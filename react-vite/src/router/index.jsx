import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage/LandingPage';
import Dashboard from '../components/pages/Dashboard';
import ProjectBoard from '../components/pages/ProjectBoard';
import Layout from './Layout';
import ProjectsPage from '../components/pages/ProjectsPage';
import ProjectPage from '../components/pages/ProjectPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'projects',
        element: <ProjectBoard />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:projectId",
        element: <ProjectPage />,
      },
      {
        path: "projects/:projectId/features/:featureId",
        element: <ProjectPage />,
      }
    ],
  },
]);
