# Lake Tana Tourist Management System (LTTMS)

A comprehensive full-stack tourism management platform for Lake Tana, built with modern web technologies.

## Overview

LTTMS is a tourist management system designed to facilitate tourism experiences around Lake Tana. The system provides both backend services and a user-friendly frontend interface for managing tourism-related activities and information. It's a complete ecosystem connecting tourists, vendors, and administrators for seamless tourism experiences.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Language**: TypeScript
- **Testing**: Jest, Supertest
- **Security**: bcryptjs, jsonwebtoken, helmet, express-rate-limit
- **Additional Tools**: Axios, React Query, Multer (file uploads)

## Project Structure

```
LTTMS/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── package.json       # Root workspace configuration
├── render.yaml        # Deployment configuration
└── .github/           # GitHub workflows and configurations
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

Install all dependencies for the workspace:

```bash
npm run install-all
```

This command installs dependencies for:
- Root workspace
- Frontend application
- Backend application

### Running the Application

#### Development Mode (Frontend + Backend)

Run both frontend and backend concurrently:

```bash
npm run dev
```

#### Frontend Only

```bash
npm run frontend
```

Starts the Next.js development server (typically on `http://localhost:3000`).

#### Backend Only

```bash
npm run backend
```

Starts the Express.js development server with nodemon for auto-reload.

## Scripts

### Root Workspace

| Command | Description |
|---------|-------------|
| `npm run install-all` | Install dependencies for all packages |
| `npm run frontend` | Start frontend development server |
| `npm run backend` | Start backend development server |
| `npm run dev` | Start both frontend and backend concurrently |

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run test` | Run tests |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Features

### 🎫 Tourist Features

- **Browse Services**: Discover a wide variety of tourism services around Lake Tana
- **Advanced Filtering**: Filter services by category, price range, ratings, and availability
- **Detailed Service Pages**: View comprehensive information, photos, reviews, and ratings
- **Booking System**: Easy-to-use booking interface with date and time selection
- **Payment Integration**: Secure payment processing with multiple payment methods
- **Booking History**: Track all past and upcoming bookings
- **Review & Rating System**: Leave reviews and ratings for services used
- **Multi-language Support**: Browse in English or Amharic
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Wishlists & Favorites**: Save favorite services for quick access
- **Real-time Availability**: Check real-time service availability
- **Booking Notifications**: Get email/SMS updates about bookings and cancellations

### 🏪 Vendor Features

- **Vendor Dashboard**: Centralized platform to manage all services
- **Service Management**: Create, edit, delete, and manage service listings
- **Pricing Management**: Set competitive pricing and manage discounts
- **Availability Calendar**: Mark available dates and time slots
- **Booking Management**: View, accept, reject, and cancel bookings
- **Revenue Analytics**: Track earnings and view detailed financial reports
- **Photo Gallery Management**: Upload and manage service photos
- **Service Categories**: Organize services by type (boat tours, restaurants, hotels, etc.)
- **Vendor Profile**: Create professional vendor profiles with descriptions and contact info
- **Messaging System**: Communicate directly with tourists about bookings
- **Ratings & Reviews**: Monitor customer feedback and ratings
- **Performance Metrics**: View key performance indicators (KPIs)

### 🛡️ Admin Features

- **Vendor Verification**: Review and approve/reject vendor applications
- **Content Moderation**: Moderate reviews, ratings, and user-generated content
- **User Management**: Manage tourist and vendor accounts
- **Service Oversight**: Monitor all services listed on the platform
- **Analytics Dashboard**: View platform-wide analytics and statistics
- **Dispute Resolution**: Handle disputes between tourists and vendors
- **Payment Verification**: Monitor and verify payment transactions
- **System Configuration**: Manage platform settings and policies
- **Reporting Tools**: Generate comprehensive reports on platform activity
- **Commission Management**: Set and manage vendor commission rates
- **Category Management**: Create and manage service categories

### 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcryptjs for secure password hashing
- **Rate Limiting**: Protect APIs from abuse and brute force attacks
- **CORS Protection**: Cross-origin resource sharing configured securely
- **Helmet Security**: HTTP headers security with Helmet.js
- **Input Validation**: Comprehensive request validation with Zod
- **Error Handling**: Secure error handling without exposing sensitive information
- **Session Management**: Secure session handling for user accounts
- **Data Encryption**: Sensitive data encryption at rest and in transit

### 📱 Technical Features

- **Responsive UI**: Tailwind CSS for modern, mobile-first design
- **State Management**: React Query for efficient server state management
- **API Integration**: Axios for seamless backend API communication
- **Comprehensive Logging**: Pino logger for detailed system monitoring
- **File Uploads**: Multer for secure file upload handling
- **Testing**: Jest and Supertest for comprehensive test coverage
- **TypeScript**: Full type safety across the entire stack
- **Code Quality**: ESLint for maintaining code standards
- **Auto-reload**: Nodemon for rapid development workflow
- **Concurrent Running**: Run frontend and backend simultaneously

### 🌟 User Experience Features

- **Intuitive Interface**: User-friendly design for all user types
- **Search Functionality**: Powerful search to find services easily
- **Sorting Options**: Sort services by rating, price, popularity, or newest
- **Quick Filters**: Common filter options for faster browsing
- **Service Recommendations**: AI-powered service recommendations based on preferences
- **Dark Mode**: Optional dark mode for comfortable viewing
- **Accessibility**: WCAG-compliant design for all users
- **Performance Optimization**: Fast loading times and smooth interactions
- **SEO Optimization**: Search engine friendly content and structure

### 💰 Payment & Transaction Features

- **Multiple Payment Methods**: Support for various payment options
- **Secure Transactions**: PCI-compliant payment processing
- **Invoice Generation**: Automatic invoice generation for bookings
- **Refund Management**: Easy refund processing and management
- **Transaction History**: Detailed transaction records for all users
- **Commission Tracking**: Clear commission calculations for vendors
- **Payment Verification**: Automatic payment verification system

### 📊 Analytics & Reporting

- **Tourist Analytics**: Track tourism trends and popular services
- **Vendor Analytics**: Business performance metrics and insights
- **Platform Metrics**: Overall platform health and activity
- **Custom Reports**: Generate reports based on specific criteria
- **Data Export**: Export data for further analysis
- **Real-time Dashboards**: Live updates on key metrics
- **Performance Tracking**: Monitor system performance and uptime

## Core Architecture

### Frontend Architecture
- **Pages & Routes**: Organized page structure with dynamic routing
- **Components**: Reusable React components with TypeScript
- **Hooks**: Custom hooks for business logic
- **Context API**: State management for global data
- **Styling**: Tailwind CSS utility-first approach

### Backend Architecture
- **Express Routes**: RESTful API endpoints
- **Controllers**: Business logic layer
- **Models**: MongoDB schemas with Mongoose
- **Middleware**: Authentication, validation, error handling
- **Services**: Reusable service functions

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh authentication token

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create new service (vendor)
- `PUT /api/services/:id` - Update service (vendor)
- `DELETE /api/services/:id` - Delete service (vendor)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Reviews
- `GET /api/reviews/:serviceId` - Get service reviews
- `POST /api/reviews` - Post new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Development

The project uses:
- **TypeScript** for type safety across the stack
- **ESLint** for code quality and style consistency
- **Nodemon** for automatic backend restart during development
- **Concurrently** to run frontend and backend in parallel
- **Jest** for unit testing
- **Supertest** for API testing

### Running Tests

```bash
# Backend tests
cd backend
npm run test

# All tests
npm run test
```

## Deployment

The project includes `render.yaml` configuration for easy deployment to Render.

### Deployment Steps

1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables
4. Deploy frontend and backend services
5. Configure custom domain (optional)

## Database Schema Overview

### Collections
- **Users**: Tourist and admin accounts
- **Vendors**: Vendor profiles and information
- **Services**: Tourism services and offerings
- **Bookings**: Booking transactions and history
- **Reviews**: Customer reviews and ratings
- **Payments**: Payment transaction records
- **Categories**: Service categories

## Performance Optimization

- **Caching**: Server-side and client-side caching strategies
- **Image Optimization**: Compressed images and lazy loading
- **Code Splitting**: Optimized bundle sizes
- **Database Indexing**: Efficient database queries
- **CDN Ready**: Static assets can be served from CDN

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using cloud MongoDB

**Dependency Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm run install-all
```

## Support & Documentation

For detailed documentation on specific modules:
- Frontend: See `frontend/README.md`
- Backend: See `backend/README.md`

## Contributing

For contributions, please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow the existing code structure and ensure all tests pass before submitting pull requests.

## Code Style Guide

- Use TypeScript for all new code
- Follow ESLint rules
- Write meaningful comments for complex logic
- Keep components small and focused
- Use meaningful variable and function names
- Write unit tests for new features

## License

Private repository

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced booking calendar
- [ ] Real-time notifications
- [ ] Video integration for services
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] Machine learning recommendations
- [ ] AI chatbot support

## Contact & Support

For support or questions:
- **Email**: desalegnkasayemuluyekasaye@gmail.com
- **GitHub**: [desalegnkasayemuluyekasaye-tech](https://github.com/desalegnkasayemuluyekasaye-tech)

---

**Repository**: [desalegnkasayemuluyekasaye-tech/LTTMS](https://github.com/desalegnkasayemuluyekasaye-tech/LTTMS)

**Last Updated**: 2026-05-12

**Status**: 🟢 Active Development
