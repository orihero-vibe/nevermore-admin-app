import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Dashboard } from '../pages/Dashboard';
import { NotFound } from '../pages/NotFound';
import { SignIn } from '../pages/SignIn';
import { ForgotPassword } from '../pages/ForgotPassword';
import { LinkSent } from '../pages/LinkSent';
import { Success } from '../pages/Success';
import { CreateNewPassword } from '../pages/CreateNewPassword';
import { ContentManagement } from '../pages/ContentManagement';
import { Journey40Day } from '../pages/Journey40Day';
import { TemptationDetails } from '../pages/TemptationDetails';
import { Settings } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SignIn />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/link-sent',
    element: <LinkSent />,
  },
  {
    path: '/success',
    element: <Success />,
  },
  {
    path: '/create-new-password',
    element: <CreateNewPassword />,
  },
  {
    path: '/dashboard',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'content-management',
        element: <ContentManagement />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'journey-40-day/:id?',
        element: <Journey40Day />,
      },
      {
        path: 'create-journey-40-day',
        element: <Journey40Day />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/content-management',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ContentManagement />,
      },
      {
        path: 'temptation-details',
        element: <TemptationDetails />,
      },
      {
        path: 'create-40-temptations',
        element: <TemptationDetails />,
      },
      {
        path: 'journey-40-day/:id?',
        element: <Journey40Day />,
      },
      {
        path: 'create-journey-40-day',
        element: <Journey40Day />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/settings',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Settings />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
