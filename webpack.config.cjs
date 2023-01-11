const path = require('path');

module.exports = {
    mode: 'development',
    entry: './test.js',
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