const presets = [
  [
    '@babel/preset-env',
    {
      debug: true,
      targets: {
        node: '14',
      },
    },
  ],
  ['@babel/preset-typescript'],
];

const plugins = [];

module.exports = { presets, plugins };
