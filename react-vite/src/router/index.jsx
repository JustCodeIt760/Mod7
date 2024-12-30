import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage/LandingPage';
import Dashboard from '../components/Pages/WorkSpace/workspace';
import Layout from './Layout';
import ProjectPage from '../components/Pages/ProjectPage';
import SprintDetailsPage from '../components/Pages/SprintDetailsPage';
import SprintTimeline from '../components/Pages/SprintTimeline';

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
        path: 'projects/:projectId',
        element: <ProjectPage />,
      },
      {
        path: 'projects/:projectId/features/:featureId',
        element: <ProjectPage />,
      },
      {
        path: 'projects/:projectId/sprints/:sprintId',
        element: (
          <div>
            <SprintTimeline />
            <SprintDetailsPage />
          </div>
        ),
      },
    ],
  },
]);
