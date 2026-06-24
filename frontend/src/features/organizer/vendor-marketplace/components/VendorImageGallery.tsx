import type { VendorGalleryImage } from '../models/vendorMarketplace.model'

interface VendorImageGalleryProps {
  images: VendorGalleryImage[]
  selectedImage: string
  onSelect: (url: string) => void
}

export function VendorImageGallery({ images, selectedImage, onSelect }: VendorImageGalleryProps) {
  if (images.length === 0) return null

  return (
    <div>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
        <img
          src={selectedImage || images[0].url}
          alt={images.find((img) => img.url === selectedImage)?.label || 'Gallery image'}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img) => (
          <button
            key={img.url}
            onClick={() => onSelect(img.url)}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === img.url ? 'border-brand-500 ring-1 ring-brand-200' : 'border-transparent hover:border-slate-300'
            }`}
          >
            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
