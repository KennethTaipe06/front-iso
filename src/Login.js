import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // Verificar si existe el token en vez de solo un booleano
    if (localStorage.getItem('token')) {
      if (window.location.pathname !== '/biblioteca') {
        navigate('/biblioteca', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Preparamos los datos para FastAPI (OAuth2 espera form-data)
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI espera 'username' aunque sea email
    formData.append('password', password);

    try {
      // 2. Petición al Backend real
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // 3. Éxito: Guardamos el Token real
      setSuccess('¡Login Exitoso! Redirigiendo...');
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('isAuthenticated', 'true'); // Mantenemos tu logica anterior por compatibilidad
      
      // Opcional: Decodificar el token para sacar el rol, o guardarlo si el backend lo devuelve
      // localStorage.setItem('userRole', 'Admin'); 

      setTimeout(() => {
        navigate('/biblioteca');
      }, 800);

    } catch (err) {
      setError('Credenciales incorrectas o error de servidor.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#5B43F1"/><path d="M24 28a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#fff" strokeWidth="2"/><path d="M16 32v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" stroke="#fff" strokeWidth="2"/></svg>
        </div>
        <h2>ISOOne</h2>
        <p className="subtitle">Sistema de Gestión Documental ISO</p>
        <form onSubmit={handleSubmit}>
          <label>Correo Electrónico</label>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="usuario@isoone.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <label>Contraseña</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Ingresar</button>
        </form>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        {/* Eliminamos la sección de credenciales de prueba o la dejamos comentada */}
        <div className="test-credentials" style={{opacity: 0.5}}>
           <p><small>Asegurate de haber creado el usuario en el Swagger /auth/registro</small></p>
        </div>
      </div>
    </div>
  );
}