# Adding Images to Your Project

## Where to Place Images

Create a folder structure:
```
public/
  images/
    lake-tana.jpg
    monastery.jpg
    boat.jpg
    hotel.jpg
    restaurant.jpg
```

## How to Use Images in Next.js

### Option 1: Using Next.js Image Component (Recommended)

```tsx
import Image from 'next/image'

<Image 
  src="/images/lake-tana.jpg" 
  alt="Lake Tana" 
  width={800} 
  height={600}
  className="rounded-lg"
/>
```

### Option 2: Using Regular img Tag

```tsx
<img 
  src="/images/lake-tana.jpg" 
  alt="Lake Tana" 
  className="w-full h-96 object-cover rounded-lg"
/>
```

## Current Placeholder Locations

Replace these gradient placeholders with real images:

1. **About Page** (pages/about.tsx, line ~45)
   - Replace: `<div className="h-96 bg-gradient-to-br...">`
   - With: `<img src="/images/lake-tana.jpg" alt="Lake Tana" className="w-full h-96 object-cover rounded-lg" />`

2. **Home Page** (pages/index.tsx, line ~57)
   - Replace service image placeholders
   - With: `<img src="/images/monastery.jpg" alt="Monastery" className="w-full h-48 object-cover" />`

3. **Services Page** (pages/services.tsx, line ~43)
   - Replace service card images
   - With: `<img src="/images/${service.category}.jpg" alt={service.name} className="w-full h-48 object-cover" />`

4. **Booking Page** (pages/booking/[id].tsx, line ~22)
   - Replace main service image
   - With: `<img src="/images/monastery-detail.jpg" alt="Service" className="w-full h-96 object-cover rounded-lg" />`

## Recommended Image Sizes

- Hero images: 1920x1080px
- Service cards: 800x600px
- Thumbnails: 400x300px
- Detail images: 1200x800px

## Free Image Sources

- Unsplash: https://unsplash.com/s/photos/ethiopia
- Pexels: https://www.pexels.com/search/lake%20tana/
- Pixabay: https://pixabay.com/images/search/ethiopia/

## Example: Update About Page with Real Image

```tsx
// Before
<div className="h-96 bg-gradient-to-br from-blue-400 to-green-400 rounded-lg flex items-center justify-center">
  <div className="text-center text-white p-8">
    <p className="text-2xl font-bold mb-2">Lake Tana</p>
  </div>
</div>

// After
<img 
  src="/images/lake-tana.jpg" 
  alt="Lake Tana - Ethiopia's largest lake" 
  className="w-full h-96 object-cover rounded-lg shadow-lg"
/>
```
