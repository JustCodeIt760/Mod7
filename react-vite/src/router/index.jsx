import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage/LandingPage';
import Dashboard from '../components/Pages/WorkSpace/workspace';
import Workspace from '../components/Pages/WorkSpace/workspace';
import Layout from './Layout';
import { ProjectPage } from '../components/Pages/ProjectPage';
import SprintDetailsPage from '../components/Pages/SprintDetailsPage';
import { SprintTimeline } from '../components/Pages/SprintTimeline';
import SignupFormPage from '../components/SignupFormPage';
import { TasksPage } from '../components/Pages/TasksPage';
import Sprints from '../components/Pages/Sprints';

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
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'sprints',
        element: <Sprints/>,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectPage />,
      },
      {
        path: 'projects/:projectId/sprints/:sprintId',
        element: <SprintTimeline />,
      },
    ],
  },
]);
