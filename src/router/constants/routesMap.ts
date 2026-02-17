const Routes = {
  HOME: '/home',
  SIGN_IN: '/sign-in',
  PERFIL: '/perfil',

  DASHBOARD: '/dashboard',
  STUDENT_TRIALS: '/minhas-trilhas',
  USERS: '/usuarios',
  USERS_NEW: '/usuarios/novo',
  USERS_EDIT: '/usuarios/:id',
  CONTENTS: '/conteudos',
  CONTENTS_NEW: '/conteudos/novo',
  CONTENTS_EDIT: '/conteudos/:id/editar',
  CONTENT_DETAILS: '/conteudos/:id',
  TRIALS: '/trilhas',
  TRIALS_NEW: '/trilhas/novo',
  TRIALS_EDIT: '/trilhas/:id/editar',
  TRIALS_DETAIL: '/trilhas/:id',

  ASSESSMENTS: '/avaliacoes',
  ASSESSMENTS_NEW: '/avaliacoes/novo',
  ASSESSMENTS_EDIT: '/avaliacoes/:id/editar',
  ASSESSMENTS_QUESTIONS: '/avaliacoes/:id',
  ASSESSMENTS_STUDENT: '/avaliacoes/estudante',
  QUESTION: '/avaliacoes/estudante/:id',

  RECOMMENDATIONS: '/recomendacoes',
  NOT_FOUND: '*',
} as const

export { Routes }
