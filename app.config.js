const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.kro.aKro.dev';
  }

  if (IS_PREVIEW) {
    return 'com.kro.aKro.preview';
  }

  return 'com.kro.aKro';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'akro (Dev)';
  }

  if (IS_PREVIEW) {
    return 'akro (Preview)';
  }

  return 'akro';
};

export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  name: getAppName(),
});
