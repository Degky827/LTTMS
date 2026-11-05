const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Lake Tana Tourism Management System (LTTMS) API',
    version: '1.0.0',
    description: `Production RESTful API documentation for the Lake Tana Tourism Management System (LTTMS V1) modular monolith.

### Features Covered:
- **Authentication & JWT Sessions**: Access token issuance, HTTP-only refresh token rotation, automatic reuse detection, and session revocation.
- **Role-Based Access Control (RBAC)**: Enforces permissions across \`tourist\`, \`vendor\`, \`support\`, \`admin\`, and \`super_admin\`.
- **User & Session Management**: Profile inspection/mutation, diagnostic account state, active session listing and selective termination.
- **Email Workflows**: Single-use cryptographic SHA-256 token verification, password recovery with zero user enumeration, and automated security alerts.
- **Administrative Governance**: User exploration with full-text search, role hierarchy defense, account suspension/lockout, and vendor approvals.
- **Tourism Services & Operations**: Eco-certified tours, boat trips, historic monastery excursions, bookings, reviews, and Chapa payment integration.`,
    contact: {
      name: 'Lake Tana Tourism Tech Team',
      email: 'tech@laketana.gov.et',
      url: 'https://laketana.gov.et'
    },
    license: {
      name: 'Proprietary / Government of Ethiopia Tourism Authority',
      url: 'https://laketana.gov.et/terms'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary Versioned API v1 (Production & Local)'
    },
    {
      url: '/api',
      description: 'Legacy API Alias (Backward-Compatible Frontend Integration)'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Registration, login, JWT token rotation, logout, 2FA, password recovery, and email verification'
    },
    {
      name: 'User Management',
      description: 'Self-service user profile, account status diagnostics, and active session inspection/revocation'
    },
    {
      name: 'Administration',
      description: 'Administrative user governance, role management, vendor approval, audit logs, and platform stats'
    },
    {
      name: 'Destinations',
      description: 'Lake Tana destinations, monasteries, waterfalls, geographic coordinates, and visitor details'
    },
    {
      name: 'Categories',
      description: 'Hierarchical tourism categories and subcategories with circular reference prevention'
    },
    {
      name: 'Vendors',
      description: 'Vendor business profiles, KYC document verification lifecycle, approvals, and suspension workflows'
    },
    {
      name: 'Services',
      description: 'Tourism service catalog, eco-certified experiences, availability, media gallery, and vendor listings'
    },
    {
      name: 'Eco-Tourism',
      description: 'Eco-badge tiers, sustainability criteria, vendor badge applications, and administrative accreditation'
    },
    {
      name: 'Bookings',
      description: 'Tourist reservations, scheduling, payment tracking, and booking cancellation workflows'
    },
    {
      name: 'Reviews',
      description: 'Tourist feedback, star ratings, and community reviews for completed experiences'
    },
    {
      name: 'Payments',
      description: 'Chapa payment gateway checkout, callback verification, and transaction tracking'
    },
    {
      name: 'Vendor Finance',
      description: 'Vendor financial ledger, commission breakdown, balance overview, and settlement payout requests'
    },
    {
      name: 'Admin Finance',
      description: 'Platform financial governance, commission rules, payouts, settlements, and refund execution'
    },
    {
      name: 'Notifications',
      description: 'In-app notifications inbox, unread counts, and real-time alerts'
    },
    {
      name: 'Support',
      description: 'Support tickets, user inquiry messaging threads, and conflict resolution'
    },
    {
      name: 'Admin Dashboard',
      description: 'Real-time operational dashboard, multi-period analytics, booking, revenue, and support metrics'
    },
    {
      name: 'Admin Exports',
      description: 'Enterprise RFC 4180 CSV export engine for bookings, transactions, commissions, refunds, reviews, and support'
    },
    {
      name: 'Messages',
      description: 'Real-time messaging, guest inquiries, and tourist-vendor communication channels'
    },
    {
      name: 'Uploads',
      description: 'Multipart image upload endpoints for profile pictures, service galleries, and KYC documents'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JSON Web Token (JWT) in the Authorization header: `Bearer <token>`'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'HTTP-only access token cookie set automatically upon successful login'
      },
      refreshTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HTTP-only refresh token cookie for seamless session rotation'
      }
    },
    schemas: {
      SafeUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '654321000000000000000001' },
          name: { type: 'string', example: 'Abebe Bikila' },
          email: { type: 'string', format: 'email', example: 'abebe@example.com' },
          role: {
            type: 'string',
            enum: ['tourist', 'vendor', 'support', 'admin', 'super_admin'],
            example: 'tourist'
          },
          phone: { type: 'string', example: '+251911223344' },
          bio: { type: 'string', example: 'Avid eco-traveler and culture enthusiast.' },
          languagePreference: { type: 'string', example: 'am' },
          avatar: { type: 'string', example: 'https://images.laketana.com/avatars/user.jpg' },
          isActive: { type: 'boolean', example: true },
          isSuspended: { type: 'boolean', example: false },
          suspendedReason: { type: 'string', nullable: true, example: null },
          isVerified: { type: 'boolean', example: true },
          twoFactorEnabled: { type: 'boolean', example: false },
          lastLogin: { type: 'string', format: 'date-time', example: '2026-11-04T10:00:00.000Z' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-01-01T08:00:00.000Z' }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, example: 'Abebe Bikila' },
          email: { type: 'string', format: 'email', example: 'abebe@example.com' },
          password: { type: 'string', minLength: 6, maxLength: 100, example: 'SecurePassword123!' },
          phone: { type: 'string', example: '+251911223344' },
          role: {
            type: 'string',
            enum: ['tourist', 'vendor'],
            default: 'tourist',
            description: 'Public role requested. Privileged roles (admin, super_admin, support) are strictly rejected.'
          }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'abebe@example.com' },
          password: { type: 'string', example: 'SecurePassword123!' },
          rememberMe: { type: 'boolean', default: false, example: true }
        }
      },
      UpdateProfileInput: {
        type: 'object',
        description: 'Whitelisted safe profile fields. Privileged fields (role, isActive, password, lockUntil) are rejected.',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, example: 'Abebe B. Bikila' },
          phone: { type: 'string', example: '+251911223344' },
          bio: { type: 'string', maxLength: 500, example: 'Updated traveler bio.' },
          languagePreference: { type: 'string', enum: ['en', 'am', 'om'], example: 'en' },
          avatar: { type: 'string', example: 'https://images.laketana.com/avatars/new.jpg' }
        }
      },
      ChangePasswordInput: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'CurrentSecret123!' },
          newPassword: { type: 'string', minLength: 6, example: 'BrandNewSecret456!' }
        }
      },
      ForgotPasswordInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'abebe@example.com' }
        }
      },
      ResetPasswordInput: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 6, example: 'FreshPassword789!' }
        }
      },
      ResendVerificationInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'abebe@example.com' }
        }
      },
      AdminStatusInput: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean', example: true },
          isSuspended: { type: 'boolean', example: false },
          suspendedReason: { type: 'string', example: 'Terms of service violation' },
          lock: { type: 'boolean', example: false, description: 'Set to false to unlock a locked account' }
        }
      },
      AdminRoleInput: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: ['tourist', 'vendor', 'support', 'admin', 'super_admin'],
            example: 'support',
            description: 'Target role to assign. Assigning admin or super_admin requires super_admin privilege.'
          }
        }
      },
      TokenResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: '9a8b7c6d5e4f3a2b1c0d...' },
          user: { $ref: '#/components/schemas/SafeUser' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              user: { $ref: '#/components/schemas/SafeUser' }
            }
          }
        }
      },
      SessionItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f' },
          family: { type: 'string', example: 'f1e2d3c4-b5a6-4789-8012-3456789abcde' },
          ip: { type: 'string', example: '197.156.104.22' },
          userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...' },
          createdAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          lastUsedAt: { type: 'string', format: 'date-time' }
        }
      },
      AccountStatus: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '654321000000000000000001' },
          email: { type: 'string', format: 'email', example: 'abebe@example.com' },
          role: { type: 'string', example: 'tourist' },
          isActive: { type: 'boolean', example: true },
          isSuspended: { type: 'boolean', example: false },
          suspendedReason: { type: 'string', nullable: true },
          isVerified: { type: 'boolean', example: true },
          twoFactorEnabled: { type: 'boolean', example: false },
          isLocked: { type: 'boolean', example: false },
          loginAttempts: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      BookingInput: {
        type: 'object',
        required: ['service', 'date'],
        properties: {
          service: { type: 'string', example: '654321000000000000000050' },
          date: { type: 'string', format: 'date', example: '2026-12-15' },
          timeSlot: { type: 'string', example: '09:00-12:00' },
          adults: { type: 'integer', minimum: 0, default: 1, example: 2 },
          children: { type: 'integer', minimum: 0, default: 0, example: 1 },
          guests: { type: 'integer', minimum: 1, example: 3 },
          specialRequests: { type: 'string', example: 'Require life jackets for children' },
          idempotencyKey: { type: 'string', example: 'bkg-req-unique-uuid-12345' }
        }
      },
      BookingResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          bookingReference: { type: 'string', example: 'LTTMS-2026-4F2A9B1C' },
          service: { type: 'string' },
          vendor: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          timeSlot: { type: 'string', example: 'all_day' },
          guests: { type: 'integer', example: 2 },
          totalAmount: { type: 'number', example: 1800 },
          currency: { type: 'string', example: 'ETB' },
          confirmationType: { type: 'string', enum: ['instant', 'vendor_confirmation'], example: 'instant' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'expired'], example: 'confirmed' },
          paymentStatus: { type: 'string', enum: ['unpaid', 'paid', 'refunded'], example: 'unpaid' }
        }
      },
      PaymentResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          txRef: { type: 'string', example: 'LTTMS-PAY-2026-A1B2C3D4' },
          receiptNumber: { type: 'string', example: 'RCP-2026-F9D1E2' },
          booking: { type: 'string' },
          user: { type: 'string' },
          amount: { type: 'number', example: 2500 },
          currency: { type: 'string', example: 'ETB' },
          paymentMethod: { type: 'string', example: 'chapa' },
          status: { type: 'string', enum: ['pending', 'successful', 'failed', 'refunded'], example: 'successful' },
          checkoutUrl: { type: 'string', example: 'https://checkout.chapa.co/checkout/pay/LTTMS-PAY-2026-A1B2C3D4' }
        }
      },
      ReceiptResponse: {
        type: 'object',
        properties: {
          receiptNumber: { type: 'string', example: 'RCP-2026-F9D1E2' },
          txRef: { type: 'string', example: 'LTTMS-PAY-2026-A1B2C3D4' },
          bookingReference: { type: 'string', example: 'LTTMS-2026-4F2A9B1C' },
          issuedAt: { type: 'string', format: 'date-time' },
          paymentStatus: { type: 'string', example: 'successful' },
          paymentMethod: { type: 'string', example: 'chapa' },
          currency: { type: 'string', example: 'ETB' },
          breakdown: {
            type: 'object',
            properties: {
              subtotal: { type: 'number', example: 2500 },
              serviceFee: { type: 'number', example: 0 },
              totalAmount: { type: 'number', example: 2500 }
            }
          }
        }
      },
      VendorFinanceOverview: {
        type: 'object',
        properties: {
          currency: { type: 'string', example: 'ETB' },
          currentBalance: { type: 'number', example: 9200 },
          availableBalance: { type: 'number', example: 7200 },
          pendingSettlementAmount: { type: 'number', example: 2000 },
          totalGrossRevenue: { type: 'number', example: 10000 },
          totalPlatformFeesPaid: { type: 'number', example: 800 },
          totalNetEarnings: { type: 'number', example: 9200 },
          totalSettledAmount: { type: 'number', example: 5000 }
        }
      },
      SettlementRequest: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 50, example: 1500 },
          payoutMethod: { type: 'string', enum: ['bank_transfer', 'telebirr', 'cbe_birr', 'manual_cash'], default: 'bank_transfer' },
          payoutDetails: {
            type: 'object',
            properties: {
              accountName: { type: 'string', example: 'Tana Eco Boat Association' },
              accountNumber: { type: 'string', example: '1000123456789' },
              bankName: { type: 'string', example: 'Commercial Bank of Ethiopia' },
              phone: { type: 'string', example: '+251911223344' }
            }
          },
          notes: { type: 'string', example: 'Bi-weekly tour settlement payout request' }
        }
      },
      SettlementResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          settlementReference: { type: 'string', example: 'SET-2026-9E4B1A7C' },
          amount: { type: 'number', example: 1500 },
          currency: { type: 'string', example: 'ETB' },
          status: { type: 'string', enum: ['requested', 'approved', 'processing', 'completed', 'rejected', 'failed'], example: 'requested' },
          payoutMethod: { type: 'string', example: 'bank_transfer' }
        }
      },
      CommissionRuleInput: {
        type: 'object',
        required: ['name', 'rate'],
        properties: {
          name: { type: 'string', example: 'Monastery Tours 5% Special Rate' },
          rate: { type: 'number', minimum: 0, maximum: 1, example: 0.05 },
          serviceCategory: { type: 'string', nullable: true },
          vendor: { type: 'string', nullable: true },
          isActive: { type: 'boolean', default: true }
        }
      },
      AvailabilityResponse: {
        type: 'object',
        properties: {
          serviceId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          timeSlot: { type: 'string', example: 'all_day' },
          totalCapacity: { type: 'integer', example: 20 },
          reservedCapacity: { type: 'integer', example: 5 },
          heldCapacity: { type: 'integer', example: 2 },
          remainingCapacity: { type: 'integer', example: 13 },
          isAvailable: { type: 'boolean', example: true }
        }
      },
      ReviewInput: {
        type: 'object',
        required: ['service', 'rating', 'comment'],
        properties: {
          service: { type: 'string', example: '660fa1b2c3d4e5f6a7b8c9d0' },
          booking: { type: 'string', example: '660fa1b2c3d4e5f6a7b8c9d1' },
          rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
          categoryRatings: {
            type: 'object',
            properties: {
              cleanliness: { type: 'number', minimum: 1, maximum: 5, example: 5 },
              ecoFriendly: { type: 'number', minimum: 1, maximum: 5, example: 5 },
              hospitality: { type: 'number', minimum: 1, maximum: 5, example: 5 },
              value: { type: 'number', minimum: 1, maximum: 5, example: 5 }
            }
          },
          title: { type: 'string', example: 'Unforgettable boat tour to Ura Kidane Mehret' },
          comment: { type: 'string', example: 'The guide was knowledgeable and the lake scenery was breathtaking.' },
          images: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      ReviewResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'object' },
          service: { type: 'string' },
          vendor: { type: 'string' },
          rating: { type: 'number' },
          comment: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'hidden', 'flagged'] },
          isVerifiedBooking: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      NotificationResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          recipient: { type: 'string' },
          type: { type: 'string', example: 'booking_confirmed' },
          title: { type: 'string', example: 'Booking Confirmed' },
          message: { type: 'string', example: 'Your reservation for Lake Tana Sunset Boat Tour has been confirmed.' },
          isRead: { type: 'boolean', example: false },
          actionUrl: { type: 'string', example: '/bookings/660fa1b2c3d4e5f6a7b8c9d1' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      SupportTicketInput: {
        type: 'object',
        required: ['subject', 'message'],
        properties: {
          subject: { type: 'string', example: 'Inquiry regarding private boat schedule' },
          category: { type: 'string', enum: ['general', 'booking', 'payment', 'vendor', 'technical', 'safety', 'refund'], default: 'general' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
          message: { type: 'string', example: 'Can we change the departure time from 8:00 AM to 9:00 AM?' },
          relatedBooking: { type: 'string' }
        }
      },
      SupportTicketResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          ticketNumber: { type: 'string', example: 'TIK-2026-9281' },
          subject: { type: 'string' },
          status: { type: 'string', enum: ['open', 'assigned', 'in_progress', 'waiting_for_user', 'waiting_for_vendor', 'resolved', 'closed', 'reopened'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sender: { type: 'string' },
                senderModel: { type: 'string' },
                message: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      },
      DashboardOverviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              overview: { type: 'object' },
              bookings: { type: 'object' },
              revenue: { type: 'object' },
              vendors: { type: 'object' },
              support: { type: 'object' }
            }
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Detailed error explanation' },
          code: { type: 'string', example: 'UNAUTHORIZED_ACCESS' },
          requestId: { type: 'string', example: '7a3c68c0-cd15-41a3-a00c-7ef534372f19' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

const fs = require('fs');

const routesDir = path.resolve(__dirname, '../routes');
const routeFiles = fs.existsSync(routesDir)
  ? fs.readdirSync(routesDir)
      .filter((file) => file.endsWith('.js'))
      .map((file) => path.join(routesDir, file))
  : [];

const swaggerOptions = {
  swaggerDefinition,
  apis: routeFiles
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerOptions
};
