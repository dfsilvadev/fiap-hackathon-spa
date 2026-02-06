export interface User {
  id: string
  name: string
  email: string
  role: string
  roleId: string
  dateOfBirth: string | null
  currentGrade: string | null
  guardians: Guardian[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  phone: string | null
}

export interface Guardian {
  name: string
  email: string
  phone: string
  relationship: string
}
