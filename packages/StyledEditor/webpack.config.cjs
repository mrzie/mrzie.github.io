const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.tsx',
    output: {
        path: path.resolve(__dirname, '../../docs/StyledEditor'),
        filename: 'bundle.js',
        clean: true,
        publicPath: '/StyledEditor/',
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
                use: ['babel-loader'],
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
        port: 3003,
        hot: true,
        historyApiFallback: {
            rewrites: [
                {from: /./, to: '/StyledEditor/index.html'},
            ],
        },
    },
};
