import { createBrowserRouter, Navigate } from 'react-router'
import AuthLayout from '../layout/auth'
import BaseLayout from '../layout/base'
import { Routes as RoutePaths } from './constants/routesMap'
import PrivateRoutes from './private'
import HomePage from '../pages/HomePage'
import SignInPage from '../pages/sign-in'
import RecommendationsPage from '@/pages/recommendations'
import ContentsPage from '@/pages/ContentsPage'
import ContentReadingPage from '@/pages/ContentReadingPage'
import NotFound from '@/pages/not-found'

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
          { path: RoutePaths.RECOMMENDATIONS.replace('/', ''), element: <RecommendationsPage /> },
          { path: RoutePaths.CONTENTS.replace('/', ''), element: <ContentsPage /> },
          // AQUI ESTÁ A CORREÇÃO: Registrando a rota de detalhes para aceitar o ID
          { path: 'conteudos/:id', element: <ContentReadingPage /> },
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