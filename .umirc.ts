import { defineConfig } from 'umi';

export default defineConfig({
  404: true, // 配置404页面
  dynamicImport: {
    loading: '@/Loading',
  },
  devServer: {
    port: 8080,
  },
  nodeModulesTransform: {
    type: 'none',
  },
  // routes: [], // 如果使用约定路由，不需要配置routes
  fastRefresh: {},
  dva: {
    immer: true,
    hmr: false,
  },
  plugins: ['./plugins/nprogress.js'],
});
