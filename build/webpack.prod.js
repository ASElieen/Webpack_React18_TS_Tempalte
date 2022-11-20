const { merge } = require("webpack-merge")
const path = require("path")
const baseConfig = require("./webpack.base")
const CopyPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CSSMinimizerPlugin = require("css-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const globAll = require("glob-all")
const PurgeCSSPlugin = require("purgecss-webpack-plugin")
const glob = require("glob")
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = merge(baseConfig, {
  mode: "production", //生产模式 开启tree-shaking和压缩代码
  plugins: [
    //复制文件插件
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public"), //复制public下文件
          to: path.resolve(__dirname, "../dist"), //复制到dist目录
          //因为html-webpack-plugin会以public下的index.html为模板生成一个index.html到dist文件下,不需要再复制了
          filter: (source) => {
            return !source.includes("index.html") //忽略index.html
          },
        },
      ],
    }),

    //抽离css
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css", //抽离css输出目录名单
    }),

    //treeshaking 处理无用css
    new PurgeCSSPlugin({
      // 检测src下所有tsx文件和public下index.html中使用的类名和id和标签名称
      // 只打包这些文件中用到的样式
      paths: globAll.sync([
        `${path.join(__dirname, "../src")}/**/*.tsx`,
        path.join(__dirname, "../public/index.html"),
      ]),
      safelist: {
        standard: [/^ant-/], // 过滤以ant-开头的类名，哪怕没用到也不删除
      },
    }),

    //gzip压缩配置
    new CompressionPlugin({
      test: /.(js|css)$/, // 只生成css,js压缩文件
      filename: "[path][base].gz", // 文件命名
      algorithm: "gzip", // 压缩格式,默认是gzip
      test: /.(js|css)$/, // 只生成css,js压缩文件
      threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
      minRatio: 0.8, // 压缩率,默认值是 0.8
    }),
  ],
  optimization: {
    minimizer: [
      new CSSMinimizerPlugin(), // 压缩css
      new TerserPlugin({
        // 压缩js
        parallel: true, // 开启多线程压缩
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"], // 删除console.log
          },
        },
      }),
    ],
    //代码分隔
    splitChunks: {
      cacheGroups: {
        //提取node_module代码
        vendors: {
          test: /node_modules/, // 只匹配node_modules里面的模块
          name: "vendors",
          minChunks: 1,
          chunks: "initial", //只提取初始化就能获取的 不管异步
          minSize: 0,
          priority: 1, //提取优先级为1
        },
        commons: {
          //提取页面公共代码
          name: "commons",
          minChunks: 2,
          chunks: "initial",
          minSize: 0,
        },
      },
    },
  },
})
