const path = require('path')

module.exports = {
    mode: 'development',
    // main file
    entry: {
        main: './index.js'
    },
    // build
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: 'index.mjs'
    },
    // 모듈 적용 map
    module: {
        rules: [
            {
                test: /\.js$/, // 적용 시킬 확장자
                include: path.join(__dirname), // 찾을 폴더
                exclude: /(node_modules)|(dist)/, // 제외할 폴더
                use: { // 적용할 모듈
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve:{
        fallback: { 'fs': false, 'path': false , 'os': false }
    }
};