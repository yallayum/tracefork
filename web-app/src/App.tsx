import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LotProvider } from './context/LotContext'
import { ThemeProvider } from './context/ThemeContext'
import CommandCenter from './pages/CommandCenter'
import TraceExplorer from './pages/TraceExplorer'
import RecallSimulator from './pages/RecallSimulator'
import ColdChainMonitor from './pages/ColdChainMonitor'
import DemoScenarios from './pages/DemoScenarios'
import AgentPage from './pages/AgentPage'

export default function App() {
  return (
    <ThemeProvider>
      <LotProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<CommandCenter />} />
              <Route path="/explorer" element={<TraceExplorer />} />
              <Route path="/simulator" element={<RecallSimulator />} />
              <Route path="/monitor" element={<ColdChainMonitor />} />
              <Route path="/demo" element={<DemoScenarios />} />
              <Route path="/agent" element={<AgentPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LotProvider>
    </ThemeProvider>
  )
}
