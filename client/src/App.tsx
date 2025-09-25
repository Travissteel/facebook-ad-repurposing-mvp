import { Dashboard } from './components/Dashboard';
import { ClientProvider } from './context/ClientContext';

function App() {
  return (
    <ClientProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </ClientProvider>
  );
}

export default App;
