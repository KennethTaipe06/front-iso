import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Biblioteca.css';

// Estos arrays ahora servirán solo para llenar los filtros del <select>
// En una app real, podrías traerlos también del backend
const controlesISO = [
  'Todos', 
  '5.1.1', '6.1.2', '8.2.1', '9.1.1', '9.2.1', '11.2.9', '12.3.1', '17.1.1'
];
const tiposDocumento = [
  'Todos', 
  'Politica', 
  'Procedimiento', 
  'Manual', 
  'Formato', 
  'Registro', 
  'Informe'
];

function Biblioteca() {
  // Estado para los datos REALES que vienen del backend
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [control, setControl] = useState('Todos');
  const [tipo, setTipo] = useState('Todos');
  
  const navigate = useNavigate();

  // --- EFECTO: CARGAR DATOS AL INICIAR ---
  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        // Usamos la ruta relativa gracias al Proxy configurado en package.json
        const response = await fetch('/api/documentos/');
        
        if (response.ok) {
          const data = await response.json();
          
          // Formateamos la fecha para que se vea bien (DD MMM YYYY)
          const docsFormateados = data.map(doc => ({
            ...doc,
            fecha: new Date(doc.fecha).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })
          }));
          
          setDocumentos(docsFormateados);
        } else {
          console.error("Error del servidor:", response.status);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token'); // Borramos también el token real
    navigate('/login');
  };

  // --- LÓGICA DE FILTRADO ---
  const filtrarDocumentos = () => {
    return documentos.filter(doc => {
      // 1. Filtro por Texto (Título)
      const coincideBusqueda = doc.titulo.toLowerCase().includes(busqueda.toLowerCase());
      
      // 2. Filtro por Control ISO
      // doc.controles es un array ej: ["5.1", "9.1"]
      const coincideControl = control === 'Todos' || doc.controles.includes(control);
      
      // 3. Filtro por Tipo
      const coincideTipo = tipo === 'Todos' || doc.tipo === tipo;
      
      return coincideBusqueda && coincideControl && coincideTipo;
    });
  };

  const docs = filtrarDocumentos();

  return (
    <div className="biblioteca-main">
      {/* Header Fijo */}
      <header className="biblioteca-header">
        <div className="logo-nombre">
          <div className="icono-logo">📚</div>
          <span className="nombre-app">ISOOne</span>
        </div>
        
        <nav className="nav-bar">
          <button className="nav-item active">Biblioteca</button>
          <button 
            className="nav-item" 
            onClick={() => navigate('/subir-documento')}
          >
            Subir Documento
          </button>
          <button className="nav-item">Reportes</button>
        </nav>

        <div className="usuario-info">
          <div className="avatar-initials">MG</div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems:'flex-end'}}>
             <span style={{fontSize: '0.9rem', fontWeight:'600'}}>María González</span>
             <span style={{fontSize: '0.75rem', color:'#6B7280'}}>Admin</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </header>

      <div className="biblioteca-content">
        <div className="header-content">
            <h1>Biblioteca Documental</h1>
            <p className="subtitulo">Gestiona y consulta la documentación del SGSI.</p>
        </div>

        {/* Barra de Controles Unificada */}
        <div className="controles-barra">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="input-busqueda"
              type="text"
              placeholder="Buscar documento por título..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          
          <div className="filtros-wrapper">
            <select className="select-filtro" value={control} onChange={e => setControl(e.target.value)}>
               {controlesISO.map(c => <option key={c} value={c}>{c === 'Todos' ? 'Todos los Controles' : `A.${c}`}</option>)}
            </select>
            
            <select className="select-filtro" value={tipo} onChange={e => setTipo(e.target.value)}>
               {tiposDocumento.map(t => <option key={t} value={t}>{t === 'Todos' ? 'Todos los Tipos' : t}</option>)}
            </select>
          </div>
        </div>

        {/* ... código anterior del header y filtros ... */}

{/* Resultados con Loading State */}
{loading ? (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
        <p>Cargando documentos...</p>
    </div>
) : (
    <>
        <div className="resultados-count">
            Mostrando {docs.length} documento{docs.length !== 1 ? 's' : ''}
        </div>

        {/* AQUÍ ESTABA EL ERROR: Solo debe haber un contenedor grid y un solo map */}
        <div className="documentos-grid">
            {docs.map((doc) => (
                <div 
                    key={doc.id_documento} // Usa el ID único, no el idx
                    className="documento-card"
                    onClick={() => navigate(`/documento/${doc.id_documento}`)} 
                    style={{cursor: 'pointer'}}
                >
                    <div className="card-header">
                        <span className={`tipo-badge badge-${doc.tipo}`}>{doc.tipo}</span>
                        <span style={{fontSize:'1.2rem', cursor:'pointer'}} onClick={(e)=>e.stopPropagation()}>⋮</span>
                    </div>
                    
                    {/* Asumiendo que aquí va el título y detalles que tenías antes */}
                    <div className="card-body">
                         <h3>{doc.titulo}</h3>
                         <p>{doc.fecha}</p>
                    </div>
                    
                    <div className="card-footer">
                        <div className="controles-list">
                            {doc.controles.map(c => (
                                <span key={c} className="control-pill">A.{c}</span>
                            ))}
                        </div>
                        <span className="btn-ver">Ver PDF &rarr;</span>
                    </div>
                </div>
            ))}
            
            {docs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#888' }}>
                    No se encontraron documentos con esos filtros.
                </div>
            )}
        </div>
    </>
)}

      </div>
    </div>
  );
}

export default Biblioteca;