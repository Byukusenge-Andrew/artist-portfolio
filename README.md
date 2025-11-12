# 🎨 Artelier - Artist Portfolio & Marketplace

A modern, full-featured art portfolio and e-commerce platform built with Next.js 15, featuring artwork galleries, favorites system, print sales, and admin management.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css)

## ✨ Features

### 🖼️ Gallery & Artwork Management

- **Dynamic Galleries**: Browse curated collections with smooth animations
- **Advanced Search & Filtering**: Filter by tags, search by title, sort by date/title
- **Image Lightbox**: Click-to-zoom with controls (zoom in/out, download, ESC to close)
- **Related Artworks**: Smart recommendations based on tags and categories
- **Loading States**: Elegant skeleton loaders for better UX

### ⭐ Favorites System

- **Persistent Favorites**: LocalStorage-based favorites that persist across sessions
- **Favorites Counter**: Real-time badge showing favorite count in header
- **Sorting Options**: Sort by newest/oldest, alphabetically (A-Z/Z-A)
- **Bulk Actions**: Clear all favorites with confirmation dialog
- **Dedicated Page**: View and manage all favorited artworks

### 🛒 E-Commerce Features

- **Original Artwork Sales**: Sell unique, one-of-a-kind pieces
- **Print Options**: Multiple print sizes and formats
- **Stripe Integration**: Secure payment processing
- **Shopping Cart**: Add to cart functionality with quantity management
- **Order Management**: Success and cancellation pages

### 🔐 Admin Features

- **Admin Authentication**: Secure login/logout with cookie-based sessions
- **Artwork Upload**: Multiple upload methods (Supabase, Cloudinary, Local)
- **Gallery Management**: Create and organize gallery collections
- **Artist Profiles**: Manage artist information and avatars

### 🎯 User Experience

- **Share Functionality**: Share artworks on Twitter, Facebook, LinkedIn, or copy link
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Smooth Animations**: Fade-in, slide-in, scale-in effects throughout
- **Glass Morphism UI**: Modern design with backdrop blur effects
- **Custom Logo**: Beautiful palette & paintbrush SVG logo

### 🎨 Design Features

- **Gradient Accents**: Teal-to-emerald gradients throughout
- **Custom Scrollbar**: Styled scrollbar matching theme colors
- **Interactive Cards**: Hover effects, overlays, and smooth transitions
- **Typography**: Optimized fonts with clear hierarchy
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Type Safety**: TypeScript

### Backend

- **Database**: MySQL with Prisma ORM
- **File Storage**: Supabase Storage
- **Image Processing**: Cloudinary, Next-Cloudinary
- **Payments**: Stripe
- **API Routes**: Next.js API Routes

### State Management

- **Global State**: React Context API (FavoritesContext)
- **Local Storage**: Browser localStorage for persistence
- **Zustand**: For complex state (optional)

## 📦 Installation

### Prerequisites

- Node.js 18+
- MySQL database
- Supabase account (for file uploads)
- Stripe account (for payments)
- Cloudinary account (optional, for image optimization)

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd artist-portfolio
```

2.**Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3.**Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/artist_portfolio"

# Supabase (for file uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudinary (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"

# Admin Authentication
ADMIN_PASSWORD="your-secure-admin-password"

# App URL (for sharing)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4.**Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

5.**Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6.**Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```bash
artist-portfolio/
├── app/
│   ├── (admin)/              # Admin-only routes
│   │   └── artworks/new/     # Upload new artwork
│   ├── (site)/               # Public site routes
│   │   ├── art/[slug]/       # Artwork detail pages
│   │   ├── galleries/        # Gallery pages
│   │   └── favorites/        # Favorites page
│   ├── admin/                # Admin auth pages
│   │   ├── login/
│   │   ├── logout/
│   │   └── signup/
│   ├── api/                  # API routes
│   │   ├── artworks/
│   │   ├── checkout/
│   │   ├── upload/
│   │   └── webhooks/
│   ├── order/                # Order success/cancel pages
│   ├── globals.css           # Global styles & animations
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── AddToCartButton.tsx
│   ├── ArtworkCard.tsx       # Reusable artwork card
│   ├── ArtworkGallery.tsx    # Gallery with search/filter
│   ├── ArtworkImage.tsx      # Image with lightbox
│   ├── FavoriteButton.tsx    # Toggle favorite
│   ├── FavoritesButton.tsx   # Header favorites counter
│   ├── Footer.tsx
│   ├── GalleryLoading.tsx    # Loading skeleton
│   ├── Header.tsx
│   ├── ImageLightbox.tsx     # Zoom modal
│   ├── LoadingSpinner.tsx
│   ├── Logo.tsx              # Custom SVG logo
│   ├── ShareButton.tsx       # Social share
│   ├── SkeletonCard.tsx
│   └── *Upload.tsx           # Upload components
├── contexts/
│   └── FavoritesContext.tsx  # Global favorites state
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── supabaseClient.ts     # Supabase client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/
└── public/                    # Static assets
```

## 🗄️ Database Schema

### Models

- **Artwork**: Main artwork entity with images, pricing, tags
- **Gallery**: Collection grouping for artworks
- **Artist**: Artist profiles with avatars
- **PrintOption**: Print sizes/formats for artworks
- **Order**: Customer orders
- **OrderItem**: Individual items in orders

## 🎯 Usage

### For Visitors

1. Browse galleries and artworks
2. Click hearts to add favorites
3. View artwork details with zoom
4. Share artworks on social media
5. Purchase originals or prints

### For Admins

1. Sign up/Login at `/admin/login`
2. Upload artworks at `/artworks/new`
3. Set pricing for originals and prints
4. Organize artworks into galleries
5. Manage orders and inventory

## 🎨 Customization

### Colors

Edit `app/globals.css` to change the color scheme:

```css
/* Primary gradient: teal to emerald */
from-teal-600 to-emerald-600

/* Adjust to your brand colors */
from-[your-color] to-[your-color]
```

### Logo

Edit `components/Logo.tsx` to customize the logo design.

### Animations

All animations are defined in `app/globals.css`:

- `animate-fade-in-up`
- `animate-slide-in-left`
- `animate-scale-in`

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- Build: `npm run build`
- Start: `npm start`
- Ensure MySQL database is accessible
- Set all environment variables

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma for the excellent ORM
- Tailwind CSS for utility-first styling
- Lucide for beautiful icons

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js 15 and React 19
