'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
    children: ReactNode;
}

export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
    return <Auth0Provider>{children}</Auth0Provider>;
}
