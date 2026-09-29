import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LaboratoryPage from './pages/LaboratoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<LaboratoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
