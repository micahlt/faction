module.exports = {
    env: { node: true, es2020: true },
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
        'no-console': 'off', // You'll need console.log for server debugging
        'no-unused-vars': 'warn',
    },
}