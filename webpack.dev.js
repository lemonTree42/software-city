const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const appDirectory = path.resolve(__dirname, ".");

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: path.resolve(appDirectory, "public/bundle"),
        compress: true,
        hot: true,
        open: false,
        https: true // enable when HTTPS is needed (necessary for WebXR)
    },
});
