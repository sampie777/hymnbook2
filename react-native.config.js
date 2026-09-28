module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    'react-native-iap': {
      platforms: {
        android: null, // disables native linking on Android as we are not using IAP in Android, but Stripe
      },
    },
  },
};
