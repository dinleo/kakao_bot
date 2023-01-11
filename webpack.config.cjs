// package.json 이 type module 이라면 .cjs 로 해야한다.
const path = require('path')
// const JsConfigWebpackPlugin = require('js-config-webpack-plugin');


module.exports = {
    mode: 'development',
    // 노드환경과 유사하게 컴파일 해준다. ( 기본값 'web' )
    target: 'node',
    // main file
    entry: {
        main: './index.js'
    },
    // build file
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: 'index.cjs'
    },
    // 모듈 적용
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
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            }
        ]
    },
};