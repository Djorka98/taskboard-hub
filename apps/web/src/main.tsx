import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { LanguageTransition } from './components/layout/language-transition';
import { UiBootstrap } from './components/layout/ui-bootstrap';
import { AuthBootstrap } from './features/auth/auth-bootstrap';
import './index.css';
import { router } from './router';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageTransition />
      <UiBootstrap />
      <AuthBootstrap />
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>,
);
