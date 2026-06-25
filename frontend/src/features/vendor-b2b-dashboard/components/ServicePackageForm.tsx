import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import { Image as ImageIcon, X, CheckCircle2 } from 'lucide-react'

export interface ServicePackageData {
  category: string
  serviceName: string
  description: string
  basePrice: number
  availabilityStatus: string
  capacity?: number
  serviceAddress?: string
}

// Must match backend validator enum exactly
const SERVICE_CATEGORIES = [
  'Catering',
  'Lights and sounds',
  'Event styling',
  'Venue decoration',
  'Photography',
  'Videography',
  'Entertainment',
  'Security',
  'Transportation',
  'Equipment rental',
  'Booth setup',
  'Stage production',
  'Event staff',
  'Cleanup crew',
] as const

interface ServicePackageFormProps {
  onSubmit: (data: ServicePackageData, imageFile?: File) => Promise<void>
  loading?: boolean
  onCancel?: () => void
}

export function ServicePackageForm({ onSubmit, loading, onCancel }: ServicePackageFormProps) {
  const [formData, setFormData] = useState<ServicePackageData>({
    category: '',
    serviceName: '',
    description: '',
    basePrice: 0,
    availabilityStatus: 'available',
    capacity: undefined,
    serviceAddress: ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB.')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.category) {
      setError('Please select a service category.')
      return
    }
    if (!formData.serviceName.trim()) {
      setError('Package name is required.')
      return
    }
    if (formData.basePrice <= 0) {
      setError('Please enter a valid base price greater than 0.')
      return
    }

    try {
      await onSubmit(formData, imageFile || undefined)
      // Reset form on success
      setFormData({
        category: '',
        serviceName: '',
        description: '',
        basePrice: 0,
        availabilityStatus: 'available',
        capacity: undefined,
        serviceAddress: ''
      })
      removeImage()
      setSuccess(true)
      // Close modal after a short delay if onCancel is provided
      if (onCancel) {
        setTimeout(() => onCancel(), 1200)
      }
    } catch (err: any) {
      // Only show error in form – do NOT let it bubble up to parent
      setError(err.message || 'Failed to create service package. Please try again.')
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">Create New Service Package</h3>
        <p className="text-sm text-slate-500 mt-1">Add a new service package to your vendor profile to be discovered in the marketplace.</p>
      </div>

      {/* Single feedback banner – either error or success, never both */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">Service package created successfully!</span>
        </motion.div>
      )}
      {error && !success && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 shrink-0">✕</button>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Package Image <span className="font-normal text-slate-400">(Optional)</span></label>
        {imagePreview ? (
          <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={[
              'w-full h-36 border-2 border-dashed border-slate-200',
              'rounded-2xl flex flex-col items-center justify-center cursor-pointer',
              'hover:border-brand-400 hover:bg-brand-50/50 transition-all text-slate-400',
            ].join(' ')}
          >
            <ImageIcon className="w-7 h-7 mb-2" />
            <span className="text-sm font-semibold text-slate-600">Click to upload image</span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleImageChange}
        />
      </div>

      {/* Category Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Service Category <span className="text-rose-500">*</span>
          </label>
          <select
            className={[
              'w-full px-4 py-2.5 rounded-xl border border-slate-200',
              'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none',
              'focus:ring-4 text-sm bg-white text-slate-900 shadow-sm transition-all appearance-none',
            ].join(' ')}
            value={formData.category}
            onChange={(e) => setFormData(s => ({ ...s, category: e.target.value }))}
            required
          >
            <option value="" disabled>Select a category…</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <Input
          label="Package Name *"
          placeholder="e.g. Premium Wedding Photos"
          value={formData.serviceName}
          onChange={(e) => setFormData(s => ({ ...s, serviceName: e.target.value }))}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
        <textarea
          className={[
            'w-full px-4 py-2.5 rounded-xl border border-slate-200',
            'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none',
            'focus:ring-4 text-sm bg-white text-slate-900 shadow-sm transition-all resize-none',
          ].join(' ')}
          rows={3}
          placeholder="Describe what is included in this service package…"
          value={formData.description}
          onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
        />
      </div>

      {/* Price, Capacity, and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Input
          label="Base Price (₱) *"
          type="number"
          min="1"
          value={formData.basePrice || ''}
          onChange={(e) => setFormData(s => ({ ...s, basePrice: Number(e.target.value) }))}
          required
        />
        <Input
          label="Max Guests"
          type="number"
          min="1"
          placeholder="e.g. 100"
          value={formData.capacity || ''}
          onChange={(e) => setFormData(s => ({ ...s, capacity: e.target.value ? Number(e.target.value) : undefined }))}
        />
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Availability Status</label>
          <select
            className={[
              'w-full px-4 py-2.5 rounded-xl border border-slate-200',
              'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none',
              'focus:ring-4 text-sm bg-white text-slate-900 shadow-sm transition-all appearance-none',
            ].join(' ')}
            value={formData.availabilityStatus}
            onChange={(e) => setFormData(s => ({ ...s, availabilityStatus: e.target.value }))}
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
          </select>
        </div>
      </div>

      {/* Service Address */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Service Location <span className="font-normal text-slate-400">(Optional)</span></label>
        <textarea
          className={[
            'w-full px-4 py-2.5 rounded-xl border border-slate-200',
            'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none',
            'focus:ring-4 text-sm bg-white text-slate-900 shadow-sm transition-all resize-none',
          ].join(' ')}
          rows={2}
          placeholder="e.g. 123 Main St, City"
          value={formData.serviceAddress || ''}
          onChange={(e) => setFormData(s => ({ ...s, serviceAddress: e.target.value }))}
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading || success}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={success}>
          {success ? 'Created!' : 'Create Package'}
        </Button>
      </div>
    </motion.form>
  )
}
