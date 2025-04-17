module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
        node: true,
        commonjs: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'prettier',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            }
        }
    },
    rules: {
        indent: ['error', 4],
        'object-curly-spacing': ['error', 'never'],
        'import/no-commonjs': 'error',
    },
    overrides: [
        {
            files: ['webpack.config.cjs'],
            env: {
                node: true,
                commonjs: true,
            },
            rules: {
                'import/no-commonjs': 'off',
                '@typescript-eslint/no-var-requires': 'off'
            },
        },
    ],
};
