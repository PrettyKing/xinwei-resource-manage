  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardIcon size={20} />,
      label: '仪表盘',
    },
    {
      key: '/dashboard/materials',
      icon: <MaterialsIcon size={20} />,
      label: '材料管理',
    },
    {
      key: '/dashboard/inbound',
      icon: <InboundIcon size={20} />,
      label: '入库管理',
    },
    {
      key: '/dashboard/suppliers',
      icon: <SuppliersIcon size={20} />,
      label: '供应商管理',
    },
    {
      key: '/dashboard/reports',
      icon: <ReportsIcon size={20} />,
      label: '统计报表',
    },
    // 用户管理 - 仅管理员可见
    ...(user?.role === 'admin' ? [{
      key: '/dashboard/users',
      icon: <UserIcon size={20} />,
      label: '用户管理',
    }] : []),
  ];