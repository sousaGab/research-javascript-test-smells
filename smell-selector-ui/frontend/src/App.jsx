import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SmellSelector from './pages/SmellSelector';
import Refatoracoes from './pages/Refatoracoes';
import DataAnalysis from './pages/DataAnalysis';
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

        <Routes>
          <Route path="/" element={<SmellSelector />} />
          <Route path="/refactorings" element={<Refatoracoes />} />
          <Route path="/analysis" element={<DataAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
