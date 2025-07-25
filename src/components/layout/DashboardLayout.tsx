'use client';

import { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Button } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/dashboard/materials',
      icon: <AppstoreOutlined />,
      label: '材料管理',
    },
    {
      key: '/dashboard/inbound',
      icon: <ShoppingCartOutlined />,
      label: '入库管理',
    },
    {
      key: '/dashboard/suppliers',
      icon: <TeamOutlined />,
      label: '供应商管理',
    },
    {
      key: '/dashboard/reports',
      icon: <BarChartOutlined />,
      label: '统计报表',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // TODO: 实现退出登录逻辑
      router.push('/login');
    } else {
      // TODO: 处理其他用户菜单项
      console.log('User menu clicked:', key);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white"
        width={256}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {!collapsed ? (
            <Title level={4} className="m-0 text-blue-600">
              信维资源管理
            </Title>
          ) : (
            <Title level={4} className="m-0 text-blue-600">
              信维
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between border-b border-gray-200">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          <Space size="middle">
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="text-gray-700">管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
