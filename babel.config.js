module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        builtIns: 'entry',
        modules: 'auto',
      },
    ],
    '@babel/plugin-proposal-object-rest-spread',
  ],
};
