const Routes = {
  HOME: 'home', // Removido '/'
  SIGN_IN: 'sign-in',
  DASHBOARD: 'dashboard',
  STUDENT_TRIALS: 'minhas-trilhas',
  USERS: 'usuarios',
  CONTENTS: 'conteudos', // Removido '/'
  CONTENT_DETAILS: 'conteudos/:id',
  TRIALS: 'trilhas',
  ASSESSMENTS: 'assessments',
  ASSESSMENTS_STUDENT: 'assessments/student',
  QUESTION: 'assessments/student/:id',
  RECOMMENDATIONS: 'recomendacoes',
  NOT_FOUND: '*',
} as const

export { Routes }