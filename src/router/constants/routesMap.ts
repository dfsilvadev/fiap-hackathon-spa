const Routes = {
  HOME: '/home',
  SIGN_IN: '/sign-in',
  PERFIL: '/perfil',

  DASHBOARD: '/dashboard',
  STUDENT_TRIALS: '/minhas-trilhas',
  USERS: '/usuarios',
  CONTENTS: '/conteudos',
  TRIALS: '/trilhas',

  ASSESSMENTS: '/avaliacoes',
  ASSESSMENTS_STUDENT: '/avaliacoes/estudante',
  QUESTION: '/avaliacoes/estudante/:id',

  RECOMMENDATIONS: '/recomendacoes',

  NOT_FOUND: '*',
} as const

export { Routes }
