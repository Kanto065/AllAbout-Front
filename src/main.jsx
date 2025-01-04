import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, } from "react-router-dom";
import './index.css'
import router from './Routes/MainRoute';
import AuthProvider from './Providers/AuthProvider';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <div className='bg-white'>
            <RouterProvider router={router} />
          </div>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>

)
