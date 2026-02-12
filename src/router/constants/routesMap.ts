const Routes = {
  HOME: '/home',
  SIGN_IN: '/sign-in',
  ASSESSMENTS: '/assessments',
  ASSESSMENTS_STUDENT: '/assessments/student',
  QUESTION: '/assessments/student/:id',
  NOT_FOUND: '*',
} as const

export { Routes }
