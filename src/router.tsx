import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from '@/App'
import { HomePage } from '@/pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
