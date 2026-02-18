import { createBrowserRouter } from 'react-router'
import AuthLayout from '../layout/auth'
import BaseLayout from '../layout/base'
import { Routes as RoutePaths } from './constants/routesMap'
import PrivateRoutes from './private'
import HomeRedirect from './HomeRedirect'

import AssessmentCreatePage from '@/pages/AssessmentCreatePage'
import AssessmentEditPage from '@/pages/AssessmentEditPage'
import AssessmentQuestionsPage from '@/pages/AssessmentQuestionsPage'
import AssessmentsListPage from '@/pages/AssessmentsListPage'
import AssessmentStudentPage from '@/pages/assessments-student'
import ContentsSwitch from '@/pages/ContentsSwitch'
import ContentReadingPage from '@/pages/ContentReadingPage'
import ContentCreatePage from '@/pages/ContentCreatePage'
import ContentEditPage from '@/pages/ContentEditPage'
import DashboardProfessorPage from '@/pages/dashboard-professor'
import DashboardStudentPage from '@/pages/dashboard-student'
import NotFound from '@/pages/not-found'
import QuestionPage from '@/pages/question'
import RecommendationsPage from '@/pages/recommendations'
import SignInPage from '@/pages/sign-in'
import ProfilePage from '@/pages/ProfilePage'
import StudentTrailsPage from '@/pages/student-trails'
import PathCreatePage from '@/pages/PathCreatePage'
import PathDetailPage from '@/pages/PathDetailPage'
import PathEditPage from '@/pages/PathEditPage'
import PathsListPage from '@/pages/PathsListPage'
import UsersListPage from '@/pages/UsersListPage'
import UserCreatePage from '@/pages/UserCreatePage'
import UserEditPage from '@/pages/UserEditPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      // Home deve levar para o dashboard correspondente ao perfil (aluno / professor)
      { path: RoutePaths.HOME.replace('/', ''), element: <HomeRedirect /> },
      { path: RoutePaths.NOT_FOUND, element: <NotFound /> },
      {
        element: <PrivateRoutes />,
        children: [
          {
            path: RoutePaths.DASHBOARD.replace('/', ''),
            element: <DashboardProfessorPage />,
          },
          {
            path: RoutePaths.DASHBOARD_STUDENT.replace('/', ''),
            element: <DashboardStudentPage />,
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
            path: RoutePaths.QUESTION.replace('/', '').replace(/^\//, ''),
            element: <QuestionPage />,
          },
          {
            path: RoutePaths.ASSESSMENTS_NEW.replace('/', ''),
            element: <AssessmentCreatePage />,
          },
          {
            path: RoutePaths.ASSESSMENTS_EDIT.replace('/', '').replace(/^\//, ''),
            element: <AssessmentEditPage />,
          },
          {
            path: RoutePaths.ASSESSMENTS_QUESTIONS.replace('/', '').replace(/^\//, ''),
            element: <AssessmentQuestionsPage />,
          },
          {
            path: RoutePaths.ASSESSMENTS.replace('/', ''),
            element: <AssessmentsListPage />,
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
          {
            path: RoutePaths.STUDENT_TRIALS.replace('/', ''),
            element: <StudentTrailsPage />,
          },
          {
            path: RoutePaths.TRIALS_NEW.replace('/', ''),
            element: <PathCreatePage />,
          },
          {
            path: RoutePaths.TRIALS_EDIT.replace('/', '').replace(/^\//, ''),
            element: <PathEditPage />,
          },
          {
            path: RoutePaths.TRIALS_DETAIL.replace('/', '').replace(/^\//, ''),
            element: <PathDetailPage />,
          },
          {
            path: RoutePaths.TRIALS.replace('/', ''),
            element: <PathsListPage />,
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
