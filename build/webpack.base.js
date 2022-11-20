const path = require("path")
//webpack需要把最终构建好的静态资源都引入到一个html文件中,这样才能在浏览器中运行
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const isDev = process.env.NODE_ENV === "development" // 是否是开发模式

module.exports = {
  entry: path.join(__dirname, "../src/index.tsx"), //入口文件
  //打包文件出口
  output: {
    filename: "static/js/[name].[chunkhash:8].js", //输出文件名
    path: path.join(__dirname, "../dist"), //打包结果输出路径
    clean: true, //清除上一次打包内容
    publicPath: "/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      //模板用root节点的模板
      template: path.resolve(__dirname, "../public/index.html"),
      inject: true, //自动注入静态资源
    }),
    //配置后会注入到业务代码中 webpack解析代码在package.json中匹配到就会设置对应的值
    new webpack.DefinePlugin({
      "process.env.BASE_ENV": JSON.stringify(process.env.BASE_ENV),
    }),

    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  module: {
    rules: [
      {
        include: [path.resolve(__dirname, "../src")], //只对src下进行loader解析
        test: /.(ts|tsx)$/, //匹配ts tsx文件
        use: ["thread-loader", "babel-loader"], //添加多进程loader
        // use: {
        //   loader: "babel-loader",
        //   options: {
        //     //预设执行顺序从右往左，先TS，在处理jsx
        //     presets: [
        //       [
        //         "@babel/present-env",
        //         {
        //           //设置兼容浏览器 但是babel会自动寻找.browserslistrc
        //           // 根据配置的浏览器兼容,以及代码中使用到的api进行引入polyfill按需添加
        //           useBuiltIns: "usage",
        //           corejs: 3, //配置使用core-js低版本
        //         },
        //       ],
        //       "@babel/preset-react",
        //       "@babel/preset-typescript",
        //     ],
        //   },
        // },
      },
      {
        test: /.css$/, //匹配CSS文件
        //loader执行顺序是从右往左,从下往上的,匹配到css文件后先用css-loader解析css, 最后借助style-loader把css插入到头部style标签中
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
        ],
      },
      {
        test: /.(png|jpg|jpeg|gif|svg)$/, //匹配图片文件
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, //小于10kb转base64
          },
        },
        generator: {
          filename: "static/images/[name].[contenthash:8][ext]", //文件输出目录和命名
        },
      },
      {
        test: /.(woff2?|eot|ttf|otf)$/, //匹配字体图标文件
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: "static/fonts/[name].[contenthash:8][ext]", //文件输出和命名
        },
      },
      {
        test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: "static/media/[name].[contenthash:8][ext]", // 文件输出目录和命名
        },
      },
    ],
  },
  resolve: {
    //当引入文件不带后缀时，来这里找后缀,除了这三个，其他文件引入要求后缀
    //提高构建速度
    extensions: [".js", ".tsx", ".ts"],
    alias: {
      "@": path.join(__dirname, "../src"),
    },
    modules: ["src", "node_modules"], // 查找第三方模块只在本项目的node_modules中查找
  },
  cache: {
    type: "filesystem", //使用文件缓存
  },
}
