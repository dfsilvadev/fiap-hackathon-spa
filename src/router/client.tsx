import { createBrowserRouter } from 'react-router'
import AuthLayout from '../layout/auth'
import BaseLayout from '../layout/base'
import { Routes as RoutePaths } from './constants/routesMap'
import PrivateRoutes from './private'
import HomeRedirect from './HomeRedirect'

import AssessmentStudentPage from '@/pages/assessments-student'
import ContentsSwitch from '@/pages/ContentsSwitch'
import ContentReadingPage from '@/pages/ContentReadingPage'
import ContentCreatePage from '@/pages/ContentCreatePage'
import ContentEditPage from '@/pages/ContentEditPage'
import DashboardProfessorPage from '@/pages/dashboard-professor'
import NotFound from '@/pages/not-found'
import QuestionPage from '@/pages/question'
import RecommendationsPage from '@/pages/recommendations'
import HomePage from '@/pages/HomePage'
import SignInPage from '@/pages/sign-in'
import ProfilePage from '@/pages/ProfilePage'
import UsersListPage from '@/pages/UsersListPage'
import UserCreatePage from '@/pages/UserCreatePage'
import UserEditPage from '@/pages/UserEditPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: RoutePaths.HOME.replace('/', ''), element: <HomePage /> },
      { path: RoutePaths.NOT_FOUND, element: <NotFound /> },
      {
        element: <PrivateRoutes />,
        children: [
          {
            path: RoutePaths.DASHBOARD.replace('/', ''),
            element: <DashboardProfessorPage />,
          },
          {
            path: RoutePaths.USERS.replace('/', ''),
            element: <UsersListPage />,
          },
          {
            path: RoutePaths.USERS_NEW.replace('/', ''),
            element: <UserCreatePage />,
          },
          {
            path: RoutePaths.USERS_EDIT.replace('/', '').replace(/^\//, ''),
            element: <UserEditPage />,
          },
          {
            path: RoutePaths.ASSESSMENTS_STUDENT.replace('/', ''),
            element: <AssessmentStudentPage />,
          },
          {
            path: RoutePaths.QUESTION.replace('/', ''),
            element: <QuestionPage />,
          },
          {
            path: RoutePaths.CONTENTS_NEW.replace('/', ''),
            element: <ContentCreatePage />,
          },
          {
            path: RoutePaths.CONTENTS_EDIT.replace('/', '').replace(/^\//, ''),
            element: <ContentEditPage />,
          },
          {
            path: RoutePaths.CONTENT_DETAILS.replace('/', '').replace(/^\//, ''),
            element: <ContentReadingPage />,
          },
          {
            path: RoutePaths.CONTENTS.replace('/', ''),
            element: <ContentsSwitch />,
          },
          {
            path: RoutePaths.RECOMMENDATIONS.replace('/', ''),
            element: <RecommendationsPage />,
          },
          {
            path: RoutePaths.PERFIL.replace('/', ''),
            element: <ProfilePage />,
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
