const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.tsx',
    output: {
        path: path.resolve(__dirname, '../../docs/textSnap'),
        filename: 'bundle.js',
        clean: true,
        publicPath: '/textSnap/',
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
                        loader: 'babel-loader' 
                    },
                    {
                        loader: '@wyw-in-js/webpack-loader',
                        options: {
                            sourceMap: process.env.NODE_ENV !== 'production',
                        },
                    }
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
        static: {
            directory: path.join(__dirname, '../../docs/textSnap'),
        },
        port: 3001,
        hot: true,
        historyApiFallback: true,
    },
}; 