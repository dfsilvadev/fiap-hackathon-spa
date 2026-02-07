import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

import { Routes } from './constants/routesMap'

export default [
  layout('../layout/base.tsx', [
    index('../pages/HomePage.tsx'),
    route(Routes.HOME.replace('/', ''), '../pages/HomePage.tsx'),
  ]),

  layout('../layout/auth.tsx', [route(Routes.SIGN_IN.replace('/', ''), '../pages/sign-in.tsx')]),
] satisfies RouteConfig
