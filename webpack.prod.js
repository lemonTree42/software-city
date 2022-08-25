const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        // Minimizing the code breaks the node module java-parser
        minimize: false
    },
});
