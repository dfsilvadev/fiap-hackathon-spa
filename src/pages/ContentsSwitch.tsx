import { useAuth } from '@/hooks/useAuth'
import ContentsManagePage from '@/pages/ContentsManagePage'
import ContentsPage from '@/pages/ContentsPage'

/**
 * At /conteudos: students see the study listing (GET /contents/for-student);
 * teachers and coordinators see the management listing (GET /contents) with filters and actions.
 */
export default function ContentsSwitch() {
  const { me } = useAuth()

  if (me?.role === 'student') {
    return <ContentsPage />
  }

  return <ContentsManagePage />
}
