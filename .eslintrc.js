module.exports = {
    extends: "airbnb-base",
    root: true,
    env: {
        node: true,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-shadow': ['error', { 'allow': ['state'] }],
        // 'no-param-reassign': ['error', { 'props': false }],
        "no-param-reassign": 0,
        "no-else-return": ["error", { "allowElseIf": true }],
        'import/extensions': ['error', 'always', {
            'js': 'never',
        }],
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};
