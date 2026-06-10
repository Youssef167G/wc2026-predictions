import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import PredictionForm from './pages/PredictionForm.jsx';
import ViewPredictions from './pages/ViewPredictions.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/predict" element={<PredictionForm />} />
      <Route path="/predictions" element={<ViewPredictions />} />
    </Routes>
  );
}
