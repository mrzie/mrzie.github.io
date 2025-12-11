const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.tsx',
    output: {
        path: path.resolve(__dirname, '../../docs/sudoku'),
        filename: 'bundle.js',
        clean: true,
        publicPath: '/sudoku/',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: '@wyw-in-js/webpack-loader',
                        options: {
                            sourceMap: process.env.NODE_ENV !== 'production',
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
        new webpack.ProvidePlugin({
            React: 'react'
        })
    ],
    devServer: {
        port: 3002,
        hot: true,
        historyApiFallback: {
            rewrites: [
                {from: /./, to: '/sudoku/index.html'},
            ],
        },
        // open: '/sudoku/',
    },
};
