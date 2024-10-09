import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from '@/components/providers/theme'
import { RecoilRoot } from 'recoil'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from "@/components/ui/sonner"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SessionProvider
    basePath={import.meta.env.VITE_API_BASE_URL + '/auth'}
    session={null}
    baseUrl='/'
    refetchOnWindowFocus
    refetchInterval={100}
  >
    <RecoilRoot>
      <ThemeProvider>
        <Toaster richColors theme='light' toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto",
          },
        }}/>
        <App />
      </ThemeProvider>
    </RecoilRoot>
  </SessionProvider>
);

postMessage({ payload: 'removeLoading' }, '*')
