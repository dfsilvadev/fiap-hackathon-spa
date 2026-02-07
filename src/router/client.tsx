import { createBrowserRouter, Navigate } from 'react-router'

import AuthLayout from '../layout/auth'
import BaseLayout from '../layout/base'

import { Routes as RoutePaths } from './constants/routesMap'
import PrivateRoutes from './private'

import SignInPage from '../pages/sign-in'
import HomePage from '../pages/HomePage'
import NotFound from '@/pages/not-found'
import AssessmentStudentPage from '@/pages/assessments-student'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      { index: true, element: <Navigate to={RoutePaths.HOME} replace /> },
      { path: RoutePaths.HOME.replace('/', ''), element: <HomePage /> },
      { path: RoutePaths.NOT_FOUND, element: <NotFound /> },
      {
        element: <PrivateRoutes />,
        children: [
          {
            path: RoutePaths.ASSESSMENTS_STUDENT.replace('/', ''),
            element: <AssessmentStudentPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: RoutePaths.SIGN_IN.replace('/', ''), element: <SignInPage /> }],
  },
])

export default router
