const path = require('path');

module.exports = {
    mode: 'development',
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.cjs',
        libraryTarget: 'commonjs2',
    },
    target: 'node',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.m?js$/, // 적용 시킬 확장자
                include: path.join(__dirname), // 찾을 폴더
                exclude: /(node_modules)|(dist)/, // 제외할 폴더
                use: { // 적용할 모듈
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            }
        ]
    },
};