const prodConfig = require("./webpack.prod")
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
const smp = new SpeedMeasurePlugin()
const { merge } = require("webpack-merge")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

// 使用smp.wrap方法,把生产环境配置传进去
module.exports = smp.wrap(
  merge(prodConfig, {
    plugins: [
      new BundleAnalyzerPlugin(), //打包结果分析可视化
    ],
  })
)
