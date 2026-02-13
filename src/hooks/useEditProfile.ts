import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserById, updateUser } from '@/resources/userResources'
import type { User, Guardian } from '../components/ui/user'

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
  message: string
}

export function useEditProfile() {
  const { me } = useAuth()
  const [formData, setFormData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (me?.sub) {
        try {
          const response = await getUserById(me.sub)
          if (isMounted) {
            const data = response.data
            setFormData({
              ...data,
              dateOfBirth: data.dateOfBirth || '',
              guardians: data.guardians || [],
            })
          }
        } catch (error) {
          console.error('Erro ao carregar dados do perfil:', error)
        } finally {
          if (isMounted) setLoading(false)
        }
      }
    }
    loadData()

    return () => {
      isMounted = false
    }
  }, [me?.sub])

  const updateField = <T extends keyof User>(field: T, value: User[T]) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const updateGuardian = (index: number, field: keyof Guardian, value: string) => {
    if (!formData) return
    const newGuardians = [...formData.guardians]
    newGuardians[index] = { ...newGuardians[index], [field]: value }
    setFormData({ ...formData, guardians: newGuardians })
  }

  const addGuardian = () => {
    if (!formData) return
    setFormData({
      ...formData,
      guardians: [...formData.guardians, { name: '', email: '', phone: '', relationship: '' }],
    })
  }

  const removeGuardian = (index: number) => {
    if (!formData) return
    setFormData({
      ...formData,
      guardians: formData.guardians.filter((_, i) => i !== index),
    })
  }

  const saveProfile = async () => {
    if (!formData || !me?.sub) return

    setIsSubmitting(true)
    try {
      const payload: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        guardians: formData.guardians,
      }

      await updateUser(me.sub, payload)
      alert(' Perfil atualizado com sucesso!')
    } catch (error: unknown) {
      console.error('Erro ao salvar perfil:', error)

      let errorMessage = 'Erro ao salvar alterações.'

      if (error && typeof error === 'object' && 'message' in error) {
        const axiosError = error as AxiosErrorResponse
        errorMessage = axiosError.response?.data?.message || axiosError.message
      }

      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    loading,
    isSubmitting,
    updateField,
    updateGuardian,
    addGuardian,
    removeGuardian,
    saveProfile,
  }
}
