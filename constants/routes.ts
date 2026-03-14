export const Routes = {
  // Auth
  welcome: '/(auth)/welcome',
  phoneLogin: '/(auth)/phone-login',
  otpVerify: '/(auth)/otp-verify',

  // Tabs
  home: '/(tabs)/',
  tracking: '/(tabs)/tracking',
  services: '/(tabs)/services',
  store: '/(tabs)/store',
  profile: '/(tabs)/profile',

  // Stack screens
  trackingDetail: '/tracking/',
  historyList: '/history/',
  historyDetail: '/history/',
  serviceDetail: '/services/',
  productDetail: '/store/',
  cart: '/store/cart',
  quote: '/quote/',
  emergency: '/emergency/',
  newsListScreen: '/news/',
  newsDetail: '/news/',
  members: '/members/',
  contact: '/contact/',
  staff: '/staff/',
} as const;
