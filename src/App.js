import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Biblioteca from './Biblioteca';
import Login from './Login';
import SubirDocumento from './SubirDocumento';
import VerDocumento from './VerDocumento'; // Importar
import Chat from './Chat';
const RutaProtegida = ({ children }) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  return isAuth ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* RUTA 1: La Biblioteca Principal */}
          <Route
            path="/biblioteca"
            element={
              <RutaProtegida>
                <Biblioteca />
              </RutaProtegida>
            }
          />

          {/* RUTA 2: La página de Subir Documento (SEPARADA) */}
          <Route
            path="/subir-documento"
            element={
              <RutaProtegida>
                <SubirDocumento />
              </RutaProtegida>
            }
          />

          <Route
            path="/documento/:id"
            element={
              <RutaProtegida>
                <VerDocumento />
              </RutaProtegida>
            }
          />

          <Route
            path="/chat"
            element={
              <RutaProtegida>
                <Chat />
              </RutaProtegida>
            }
          />

          {/* Redirección por defecto */}
          <Route
            path="*"
            element={<Navigate to={localStorage.getItem('isAuthenticated') === 'true' ? "/biblioteca" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;