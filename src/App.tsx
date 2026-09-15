import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import LaboratoryPage from './pages/LaboratoryPage';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="*" element={<LaboratoryPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
