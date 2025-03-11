module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      [
        'module:react-native-dotenv',
        {
          allowUndefined: true,
          moduleName: '@env',
          path: '.env',
          safe: false,
          verbose: false,
        },
      ],
    ],
    presets: ['babel-preset-expo'],
  };
};
