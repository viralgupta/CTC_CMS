import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from '@/components/providers/theme'
import { RecoilRoot } from 'recoil'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from "@/components/ui/sonner"
import { APIProvider } from '@vis.gl/react-google-maps'
import RecoilNexus from 'recoil-nexus'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SessionProvider
    basePath={import.meta.env.VITE_API_BASE_URL + "/auth"}
    session={null}
    baseUrl="/"
    refetchOnWindowFocus
    refetchInterval={100}
  >
    <RecoilRoot>
      <ThemeProvider>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API}>
          <Toaster richColors theme="light" toastOptions={{}} />
          <RecoilNexus/>
          <App />
        </APIProvider>
      </ThemeProvider>
    </RecoilRoot>
  </SessionProvider>
);

postMessage({ payload: 'removeLoading' }, '*')
