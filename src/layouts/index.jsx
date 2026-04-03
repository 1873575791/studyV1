import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { routes } from '@/config/routes';
import { history, useLocation } from 'umi';
import { Layout, Menu } from 'antd';
import { useState, useEffect } from 'react';

const { Header, Content } = Layout;
const items = routes.map((item) => {
  return {
    key: item.path,
    label: item.name,
  };
});
export default function Index(props) {
  const [defaultKeys, setDefaultKeys] = useState('/');
  const loc = useLocation();

  useEffect(() => {
    if (loc) {
      setDefaultKeys(loc.pathname);
    }
  }, [loc]);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[defaultKeys]}
            items={items}
            style={{
              flex: 1,
              minWidth: 0,
            }}
            onClick={({ key }) => {
              history.push(key);
            }}
          />
        </Header>
      </Layout>
      <Content>
        <div
          style={{
            background: '#fff',
            minHeight: 280,
            borderRadius: '8px',
            height: 'calc(100vh - 64px)',
            overflow: 'scroll',
          }}
        >
          {props.children}
        </div>
      </Content>
    </ConfigProvider>
  );
}
