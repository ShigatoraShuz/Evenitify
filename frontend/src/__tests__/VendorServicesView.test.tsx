import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { VendorServicesView } from '../features/vendor-b2b-dashboard/views/VendorServicesView'
import type { VendorService } from '../services/vendorService'

const service = {
  id: 'service-1',
  vendor_id: 'vendor-1',
  category: 'Catering',
  service_name: 'Premium Catering',
  description: 'Full-service catering with plated dining and dietary handling.',
  base_price: 15000,
  availability_status: 'available',
  capacity: 200,
  service_address: 'Rooftop venue',
} as VendorService

describe('VendorServicesView', () => {
  it('shows a delete action and confirms service removal', async () => {
    const onDeleteServicePackage = vi.fn().mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <VendorServicesView
          services={[service]}
          loading={false}
          submitting={false}
          error={null}
          onCreateServicePackage={vi.fn()}
          onDeleteServicePackage={onDeleteServicePackage}
          onClearError={vi.fn()}
        />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /delete premium catering/i }))

    expect(screen.getByText(/delete "premium catering"/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }))

    expect(onDeleteServicePackage).toHaveBeenCalledWith('service-1')
  })
})
