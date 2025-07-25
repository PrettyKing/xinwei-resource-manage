'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      // TODO: 实现实际的登录逻辑
      console.log('登录信息:', values);
      
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('登录成功！');
      router.push('/dashboard');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-md shadow-xl"
        style={{ borderRadius: '12px' }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <LoginOutlined className="text-white text-2xl" />
          </div>
          <Title level={2} className="mb-2">信维资源管理系统</Title>
          <Text type="secondary">材料入库管理后台</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-12"
            >
              {loading ? '登录中...' : '立即登录'}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Space direction="vertical" size="small">
              <Text type="secondary" className="text-sm">
                默认账号密码：admin / 123456
              </Text>
              <Text type="secondary" className="text-xs">
                如需帮助，请联系系统管理员
              </Text>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
