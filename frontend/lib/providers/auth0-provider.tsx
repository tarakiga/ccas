'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';
import { ReactNode, useState, useEffect } from 'react';

interface Auth0ProviderWrapperProps {
    children: ReactNode;
}

export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        // Check if Auth0 environment is configured
        if (typeof window !== 'undefined') {
            console.log('[Auth0] Initializing Auth0Provider...');
        }
    }, []);

    if (hasError) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
                <h1>Authentication Error</h1>
                <p>{errorMessage || 'Failed to initialize authentication. Please check Auth0 configuration.'}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Check browser console for details.</p>
            </div>
        );
    }

    try {
        return <Auth0Provider>{children}</Auth0Provider>;
    } catch (error) {
        console.error('[Auth0] Provider initialization error:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}
