const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    devtool: 'source-map', // generate source map
    entry: {
        'huras_job_app': './index.jsx'
    },
    output: {
        path: path.resolve(__dirname, '../'),
        filename: "[name].js",
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    target: 'web',
    module: {
        rules: [{
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.scss$/i,
                use: ["style-loader", "css-loader", "sass-loader"],
            },

            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    }
                }
            },
            {
                test: /\.svg$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'img'
                    }
                }]
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
            })
        ]
    },
    mode: 'development',
    // set watch mode to `true`
    watch: true
};