'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { Button, Avatar, Dropdown, Spin } from 'antd';
import { LogoutOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export function Auth0UserMenu() {
    const { user, isLoading, error } = useUser();

    if (isLoading) {
        return <Spin size="small" />;
    }

    if (error) {
        return null;
    }

    if (!user) {
        return (
            <a href="/api/auth/login">
                <Button type="primary" icon={<LoginOutlined />}>
                    Sign In
                </Button>
            </a>
        );
    }

    const menuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: (
                <div className="px-2 py-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <a href="/api/auth/logout" className="flex items-center gap-2">
                    <LogoutOutlined />
                    Sign Out
                </a>
            ),
            danger: true,
        },
    ];

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <div className="cursor-pointer flex items-center gap-2">
                <Avatar
                    src={user.picture}
                    icon={!user.picture && <UserOutlined />}
                    size="default"
                />
                <span className="hidden md:inline text-sm font-medium">{user.name}</span>
            </div>
        </Dropdown>
    );
}

export function LoginButton() {
    return (
        <a href="/api/auth/login">
            <Button type="primary" icon={<LoginOutlined />} size="large">
                Sign In with Auth0
            </Button>
        </a>
    );
}

export function LogoutButton() {
    return (
        <a href="/api/auth/logout">
            <Button type="default" icon={<LogoutOutlined />} danger>
                Sign Out
            </Button>
        </a>
    );
}
