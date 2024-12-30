import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage/LandingPage';
import Workspace from '../components/Pages/WorkSpace/workspace';
import ProjectBoard from '../components/Pages/ProjectBoard';
import Layout from './Layout';
import ProjectsPage from '../components/Pages/ProjectsPage';
import ProjectPage from '../components/Pages/ProjectPage';
import SignupFormPage from '../components/SignupFormPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: 'signup',
        element: <SignupFormPage />,
      },
      {
        path: 'projects',
        element: <Workspace />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectPage />,
      },
      {
        path: 'projects/:projectId/features/:featureId',
        element: <ProjectPage />,
      },
    ],
  },
]);
