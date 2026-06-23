export type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'unauthorized' | 'incomplete_profile'

export type UserRole = 'organizer' | 'vendor' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  displayName: string | null
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  role: UserRole
  displayName: string
}

export const DEFAULT_LOGIN_FORM: LoginForm = {
  email: '',
  password: ''
}

export const DEFAULT_REGISTER_FORM: RegisterForm = {
  email: '',
  password: '',
  role: 'organizer',
  displayName: ''
}
