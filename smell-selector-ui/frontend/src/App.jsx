import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SmellSelector from './pages/SmellSelector';
import Refatoracoes from './pages/Refatoracoes';
import DataAnalysis from './pages/DataAnalysis';

import AnalysisLayout from './pages/AnalysisLayout';
import RQ1 from './pages/RQ1';
import RQ2 from './pages/RQ2';
import RQ3 from './pages/RQ3';
import RQ4 from './pages/RQ4';
import RQ5 from './pages/RQ5';
import Overview from './pages/Overview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <div>
              <h1>Test Smell Research</h1>
              <p>Select and manage test smells for refactoring experiments</p>
            </div>
            <nav className="main-nav">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              >
                Smell Selector
              </NavLink>
              <NavLink
                to="/refactorings"
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              >
                Refactorings
              </NavLink>
              <NavLink
                to="/analysis"
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              >
                Data Analysis
              </NavLink>
            </nav>
          </div>
        </header>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<SmellSelector />} />
            <Route path="/refactorings" element={<Refatoracoes />} />
            <Route path="/analysis" element={<AnalysisLayout />}>
              <Route index element={<DataAnalysis />} />
              <Route path="overview" element={<Overview />} />
              <Route path="rq1" element={<RQ1 />} />
              <Route path="rq2" element={<RQ2 />} />
              <Route path="rq3" element={<RQ3 />} />
              <Route path="rq4" element={<RQ4 />} />
              <Route path="rq5" element={<RQ5 />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
