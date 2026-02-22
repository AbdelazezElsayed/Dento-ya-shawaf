# API Service Architecture

نظام API منظم واحترافي وكامل للتطبيق

## 📁 Structure

```
services/api/
├── config.ts              # API configuration and endpoints
├── client.ts              # Axios client instance with helpers
├── index.ts               # Central export point
├── interceptors/
│   ├── setup.ts           # Setup all interceptors
│   ├── request.interceptor.ts   # Request configuration and auth
│   └── response.interceptor.ts  # Response handling and errors
├── endpoints/
│   ├── auth.endpoints.ts          # Authentication endpoints
│   ├── appointments.endpoints.ts  # Appointment management
│   ├── doctors.endpoints.ts       # Doctor operations
│   └── index.ts                   # Export all endpoints
├── types/
│   └── api.types.ts       # Shared API type definitions
└── utils/
    ├── retry.ts           # Retry mechanism with exponential backoff
    └── cache.ts           # API response caching utility
```

## 🚀 Usage

### Basic API Calls

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/api';

// GET request
const response = await apiGet('/users/profile');

// POST request
const result = await apiPost('/appointments', appointmentData);

// PATCH request
const updated = await apiPatch('/users/profile', updateData);

// DELETE request
const deleted = await apiDelete('/appointments/123');
```

### Using Endpoints

```typescript
import { appointmentsEndpoints, authEndpoints, doctorsEndpoints } from '@/services/api';

// Login
await authEndpoints.login({ email: 'user@example.com', password: 'password' });

// Get appointments
const appointments = await appointmentsEndpoints.list();

// Create appointment
await appointmentsEndpoints.create({
  doctorId: 'doc123',
  clinicId: 'clinic456',
  appointmentDate: '2025-12-01',
  timeSlot: '10:00'
});

// Get doctors
const doctors = await doctorsEndpoints.list({ specialization: 'Orthodontics' });
```

### Error Handling

```typescript
import { handleApiError, ApiError } from '@/services/api';

try {
  await apiGet('/users/profile');
} catch (error) {
  const apiError = handleApiError(error) as ApiError;
  console.error('Status:', apiError.status);
  console.error('Message:', apiError.message);
  console.error('Network Error:', apiError.isNetworkError);
}
```

### Retry Mechanism

```typescript
import { retryWithBackoff } from '@/services/api';

const result = await retryWithBackoff(
  () => apiGet('/appointments'),
  {
    attempts: 3,
    delay: 1000,
    backoff: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    }
  }
);
```

### Caching

```typescript
import { apiCache } from '@/services/api';

// Get cached data
let doctors = apiCache.get('doctors-list');

if (!doctors) {
  // Fetch from API
  doctors = await doctorsEndpoints.list();
  
  // Cache for 5 minutes
  apiCache.set('doctors-list', doctors, 5 * 60 * 1000);
}
```

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh token
- `POST /auth/verify-2fa` - Verify 2FA code

### Appointments
- `GET /appointments` - List appointments
- `GET /appointments/:id` - Get appointment
- `POST /appointments` - Create appointment
- `PATCH /appointments/:id` - Update appointment
- `POST /appointments/:id/cancel` - Cancel appointment
- `POST /appointments/:id/reschedule` - Reschedule appointment
- `GET /appointments/available` - Get available slots

### Doctors
- `GET /doctors` - List doctors
- `GET /doctors/:id` - Get doctor profile
- `GET /doctors/:id/schedule` - Get doctor schedule
- `GET /doctors/:id/reviews` - Get doctor reviews
- `PATCH /doctors/:id/availability` - Update availability

### And many more...

## 🔐 Features

- ✅ Automatic authentication token injection
- ✅ Request/Response logging in development
- ✅ Centralized error handling
- ✅ Retry mechanism with exponential backoff
- ✅ Response caching utility
- ✅ Type-safe API calls
- ✅ Language header support (Arabic/English)
- ✅ Request ID tracking
- ✅ Automatic 401 handling (logout on token expire)

## 🛠️ Configuration

Edit `config.ts` to customize:
- Base URL
- Timeout
- Retry attempts
- Default headers

## 📝 Adding New Endpoints

1. Create file in `endpoints/` folder
2. Export functions using API helpers
3. Add to `endpoints/index.ts`
4. Add endpoint URLs to `config.ts`

Example:
```typescript
// endpoints/clinics.endpoints.ts
import { apiGet } from '../client';
import { API_ENDPOINTS } from '../config';

export const clinicsEndpoints = {
  list: async (params) => apiGet(API_ENDPOINTS.CLINICS.LIST, { params }),
  getById: async (id) => apiGet(API_ENDPOINTS.CLINICS.GET_BY_ID(id)),
};
```
