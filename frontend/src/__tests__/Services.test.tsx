import { describe, it, expect } from 'vitest'
import { authService } from '../services/authService'
import { eventService } from '../services/eventService'
import { api } from '../services/apiClient'

describe('Service layer smoke checks', () => {
  it('authService exports expected methods', () => {
    expect(authService.login).toBeDefined()
    expect(authService.register).toBeDefined()
    expect(authService.getMe).toBeDefined()
    expect(authService.logout).toBeDefined()
    expect(authService.refreshSession).toBeDefined()
  })

  it('eventService exports expected methods', () => {
    expect(eventService.listEvents).toBeDefined()
    expect(eventService.createEvent).toBeDefined()
    expect(eventService.getEventPortfolio).toBeDefined()
  })

  it('apiClient exports api object', () => {
    expect(api.get).toBeDefined()
    expect(api.post).toBeDefined()
    expect(api.patch).toBeDefined()
    expect(api.delete).toBeDefined()
  })
})
