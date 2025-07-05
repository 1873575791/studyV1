
// 获取配置中的路由表
export default (api)=> {
  api.logger.info('Hello from custom plugin!');

    // 添加一个新的 umi 命令
    api.registerCommand({
        name: 'hello',
        fn() {
            console.log('Hello, UmiJS!');
        },
    });

    // 添加一个新的配置项
    api.describe({
        key: 'customPlugin',
        config: {
            default: {},
            schema(joi) {
                return joi.object({
                    customOption: joi.string(),
                });
            },
        },
    });

    api.onGenerateFiles(() => {
      // const routes = api.appData.routes;
      console.log(api.config.routes);
      // api.writeTmpFile({
      //   path: 'plugin/routes.ts',
      //   content: `export const routes = ${JSON.stringify(routes, null, 2)};`,
      // });
    });
}