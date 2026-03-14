# Wraptors Inc. — Premium Automotive Customer App

A fully-featured, production-minded React Native MVP for **Wraptors Inc.**, a members-based premium automotive wrap and protection service company.

Built with a luxury black-and-gold aesthetic, this app covers the full customer and operational lifecycle — from authentication through real-time service tracking, all the way to a staff simulation dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 52) |
| Navigation | Expo Router v4 (file-based) |
| Language | TypeScript (strict) |
| State | Zustand v5 |
| Persistence | AsyncStorage |
| UI | StyleSheet + Expo LinearGradient |
| Icons | @expo/vector-icons (Ionicons) |
| Auth (MVP) | Mocked OTP (code: `123456`) |

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli` (optional — can use `npx`)
- iOS Simulator (Xcode on macOS) or Android Emulator (Android Studio)
- Or physical device with Expo Go app

---

## Installation

```bash
# 1. Navigate to the project directory
cd "Wraptors Inc."

# 2. Install dependencies
npm install

# 3. Start the Expo dev server
npm start
```

---

## Running the App

### iOS Simulator (macOS only)
```bash
npm run ios
# Or from the Expo dev server, press 'i'
```

### Android Emulator
```bash
npm run android
# Or from the Expo dev server, press 'a'
# Requires Android Studio + an emulator configured
```

### Physical Device with Expo Go
1. Install **Expo Go** from the App Store or Google Play
2. Run `npm start`
3. Scan the QR code with your phone camera (iOS) or the Expo Go app (Android)

### Web (limited support)
```bash
npm run web
```

---

## MVP Authentication

For the MVP, the OTP verification is **mocked**:

1. Enter any US phone number (10 digits)
2. You'll be "sent" a code — the code is always **`123456`**
3. Enter `123456` on the OTP screen to log in

**Guest mode** is also available — tap "Continue as Guest" on the welcome screen.

---

## Project Structure

```
Wraptors Inc./
├── app/                        # Expo Router screens (file-based navigation)
│   ├── _layout.tsx             # Root layout (providers, splash)
│   ├── index.tsx               # Entry redirect (auth state check)
│   ├── (auth)/                 # Auth stack
│   │   ├── welcome.tsx         # Welcome / landing screen
│   │   ├── phone-login.tsx     # Phone number entry
│   │   └── otp-verify.tsx      # OTP verification
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home screen
│   │   ├── tracking.tsx        # Tracking dashboard
│   │   ├── services.tsx        # Services listing
│   │   ├── store.tsx           # Shop / products
│   │   └── profile.tsx         # User profile
│   ├── tracking/[id].tsx       # Service job detail
│   ├── history/
│   │   ├── index.tsx           # Service history list
│   │   └── [id].tsx            # History detail
│   ├── services/[id].tsx       # Service detail page
│   ├── store/
│   │   ├── [id].tsx            # Product detail
│   │   └── cart.tsx            # Shopping cart
│   ├── quote/index.tsx         # Free quote request form
│   ├── emergency/index.tsx     # Emergency service request
│   ├── news/
│   │   ├── index.tsx           # News listing
│   │   └── [id].tsx            # Article detail
│   ├── members/index.tsx       # Members-only section
│   ├── contact/index.tsx       # Contact us
│   └── staff/index.tsx         # Staff simulation dashboard ⚙️
│
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx          # Gold gradient + variant buttons
│   │   ├── Card.tsx            # Premium card container
│   │   ├── Input.tsx           # Styled text input
│   │   ├── Badge.tsx           # Status badges
│   │   ├── ProgressBar.tsx     # Animated gold progress bar
│   │   ├── GoldDivider.tsx     # Gold gradient divider
│   │   ├── SectionHeader.tsx   # Section title + action link
│   │   ├── ScreenHeader.tsx    # Back nav + title header
│   │   ├── EmptyState.tsx      # Empty content placeholder
│   │   └── MembershipBadge.tsx # Tier indicator badge
│   ├── home/
│   │   └── ActiveServiceCard.tsx  # Active job preview card
│   └── tracking/
│       └── StageTimeline.tsx   # Visual 9-stage timeline
│
├── constants/
│   ├── theme.ts                # Colors, typography, spacing, shadows
│   └── routes.ts               # Route constants
│
├── types/
│   └── index.ts                # All TypeScript interfaces/types
│
├── store/                      # Zustand state stores
│   ├── authStore.ts            # Auth state + OTP flow
│   ├── serviceStore.ts         # Active jobs + staff updates
│   ├── cartStore.ts            # Shopping cart
│   └── quoteStore.ts           # Quote requests
│
├── data/
│   └── mockData.ts             # Seed data for MVP
│
├── utils/
│   └── helpers.ts              # Date, currency, phone formatters
│
└── assets/
    └── images/                 # App icons and splash assets
```

---

## Key Features

### Customer Flows
| Feature | Status |
|---------|--------|
| Phone number login (OTP) | ✅ Mocked (code: 123456) |
| Guest browsing | ✅ |
| Home screen with active jobs | ✅ |
| Real-time service tracking | ✅ |
| 9-stage progress timeline | ✅ |
| Service history + detail | ✅ |
| Free quote request | ✅ |
| Emergency service request | ✅ |
| Services catalog | ✅ |
| Store + cart + checkout (mock) | ✅ |
| News + article detail | ✅ |
| Members-only section | ✅ |
| Contact + hours + form | ✅ |
| Profile + vehicle management | ✅ |
| Notification preferences | ✅ |

### Staff / Operational Flows
| Feature | Status |
|---------|--------|
| Staff dashboard (simulation) | ✅ |
| Advance service stages | ✅ |
| Add technician notes | ✅ |
| Update individual stage status | ✅ |
| Media upload placeholders | ✅ |
| Changes reflect in customer view | ✅ |

---

## Staff Dashboard

The staff simulation screen is accessible from:
- The home screen settings icon (⚙️) in the top right
- Or the "wrench" icon on any tracking detail screen

This is a **dev/internal simulation** to prove the end-to-end service update workflow. In production, this becomes a separate admin portal.

---

## Backend Integration Guide (v2)

### Authentication
Replace mock OTP in `store/authStore.ts`:
```typescript
// FUTURE: Supabase phone auth
import { supabase } from '@/lib/supabase'
await supabase.auth.signInWithOtp({ phone })
await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
```

### Database (Supabase / Postgres)
Replace AsyncStorage mock data with real queries:
```typescript
// FUTURE: Real data fetching
const { data } = await supabase
  .from('service_jobs')
  .select('*, stages(*), vehicle(*)')
  .eq('user_id', userId)
```

### Real-Time Updates
```typescript
// FUTURE: Supabase realtime subscription
supabase
  .from('service_jobs')
  .on('UPDATE', (payload) => updateJob(payload.new))
  .subscribe()
```

### File Storage (Progress Photos)
```typescript
// FUTURE: Supabase Storage or S3
const { data } = await supabase.storage
  .from('service-media')
  .upload(`jobs/${jobId}/${filename}`, file)
```

### Store / Payments
```typescript
// FUTURE: Stripe integration
import Stripe from 'stripe'
const session = await stripe.checkout.sessions.create({
  line_items: cartItems,
  mode: 'payment',
})
```

### Push Notifications
```typescript
// FUTURE: Expo Notifications + backend webhooks
import * as Notifications from 'expo-notifications'
const token = await Notifications.getExpoPushTokenAsync()
// Store token in user profile, send via Expo's push API from backend
```

---

## Remaining for v2

- [ ] Real Supabase/Firebase backend
- [ ] Real SMS OTP via Twilio or Supabase Auth
- [ ] Progress photo/video upload (Supabase Storage)
- [ ] Push notifications for service updates
- [ ] Stripe checkout integration
- [ ] Admin/staff web portal (Next.js)
- [ ] Google Maps integration for contact page
- [ ] Vehicle image upload
- [ ] Before/after photo gallery
- [ ] Invoice PDF generation
- [ ] Rating & review system
- [ ] Full CRM integrations
- [ ] Analytics (Mixpanel / PostHog)

---

## Notes

- All data is stored locally via AsyncStorage for MVP
- The OTP code for testing is always `123456`
- The staff dashboard is accessible via the ⚙️ button on home or in tracking detail
- Mock data seeds on first launch — data persists across app restarts
- The app uses system fonts for MVP; custom fonts (e.g. Montserrat) can be added via `expo-font`

---

*Built as a production-minded MVP — Wraptors Inc. v1.0.0*
# Wraptors-inc.-App
