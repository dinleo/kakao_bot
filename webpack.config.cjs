const path = require('path');

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.cjs',
        library: 'index',
        libraryTarget: 'commonjs2',
    },
    target: 'node',
    devtool: 'source-map',
    // Work around "Error: Can't resolve 'pg-native'"
};