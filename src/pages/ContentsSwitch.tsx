import { useAuth } from '@/hooks/useAuth'
import ContentsPage from '@/pages/ContentsPage'
import ContentsManagePage from '@/pages/ContentsManagePage'

/**
 * Em /conteudos: aluno vê a listagem para estudo (GET /contents/for-student);
 * professor e coordenador vêem a listagem de gestão (GET /contents) com filtros e ações.
 */
export default function ContentsSwitch() {
  const { me } = useAuth()

  if (me?.role === 'student') {
    return <ContentsPage />
  }

  return <ContentsManagePage />
}
