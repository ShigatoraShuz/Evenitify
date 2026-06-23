import { describe, expect, it } from 'vitest'
import { auditService } from '../services/auditService'
import { documentService } from '../services/documentService'
import { realtimeService } from '../services/realtimeService'
import { reportToCsv, type ReportBundle } from '../services/reportService'
import { buildVendorRecommendations } from '../features/vendor-procurement/viewmodels/vendorScoring'
import type { EventRequirement } from '../services/eventService'
import type { VendorSearchResult } from '../services/vendorService'

describe('Phase 6 frontend helpers', () => {
  it('exports realtime, document, and audit mock service data', async () => {
    await expect(realtimeService.getSnapshot('test')).resolves.toMatchObject({ channel: 'test', connected: true })
    await expect(documentService.mockUpload('owner-1', 'contract.pdf')).resolves.toMatchObject({ ownerId: 'owner-1', state: 'pending_review' })
    await expect(auditService.listActivities('scope')).resolves.toHaveLength(2)
  })

  it('serializes report bundles to CSV', () => {
    const report: ReportBundle = {
      title: 'Test Report',
      subtitle: 'Export check',
      generatedAt: '2026-06-23T00:00:00.000Z',
      metrics: [{ label: 'Total', value: 2 }],
      tables: [{ title: 'Rows', columns: ['Name', 'Status'], rows: [{ Name: 'Alpha', Status: 'Ready' }] }]
    }
    expect(reportToCsv(report)).toContain('Test Report')
    expect(reportToCsv(report)).toContain('Alpha,Ready')
  })

  it('scores vendor recommendations with budget and verification insights', () => {
    const requirement: EventRequirement = {
      id: 'req-1',
      event_id: 'event-1',
      category: 'Catering',
      quantity: 1,
      min_budget: 500,
      max_budget: 1000,
      requirement_status: 'open',
      notes: null,
      created_at: '2026-06-23T00:00:00.000Z'
    }
    const vendors: VendorSearchResult[] = [{
      id: 'vendor-1',
      business_name: 'Best Catering',
      contact_number: null,
      service_area: 'Shanghai',
      rating: 4.9,
      verification_status: 'verified',
      services: [{
        id: 'svc-1',
        vendor_id: 'vendor-1',
        category: 'Catering',
        service_name: 'Buffet',
        description: null,
        base_price: 900,
        availability_status: 'available'
      }]
    }]

    const [recommendation] = buildVendorRecommendations(vendors, requirement, { category: null, location: 'Shanghai', minBudget: null, maxBudget: null, minRating: null, businessName: '', availability: '', sortBy: 'rating' })
    expect(recommendation.score).toBe(100)
    expect(recommendation.insights.map((insight) => insight.label)).toEqual(expect.arrayContaining(['Budget fit', 'Verified', 'Service area match']))
  })
})
