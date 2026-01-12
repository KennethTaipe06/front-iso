import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubirDocumento.css';
import './Biblioteca.css';

const tiposDocumento = ['Politica', 'Procedimiento', 'Manual', 'Formato', 'Registro', 'Informe'];
// Estos deben coincidir con los códigos que cargamos en seed_data.py
const controlesISO = ['5.1.1', '6.1.2', '8.2.1', '9.1.1', '9.2.1', '11.2.9', '12.3.1', '17.1.1'];

function SubirDocumento() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados del formulario
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('Politica');
  const [proceso, setProceso] = useState('');
  const [version, setVersion] = useState('1.0');
  const [control, setControl] = useState('5.1.1'); // Nuevo estado para el control

  const [loading, setLoading] = useState(false);

  // Manejadores de Archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      if (!titulo) {
        setTitulo(selectedFile.name.replace('.pdf', '').replace(/-/g, ' '));
      }
    } else {
      alert('Por favor, sube solo archivos PDF.');
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-active'); };
  const handleDragLeave = (e) => { e.currentTarget.classList.remove('drag-active'); };

  // --- LÓGICA DE GUARDAR ---
  const handleGuardar = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('titulo', titulo);
    formData.append('tipo', tipo);
    formData.append('proceso', proceso);
    formData.append('version', version);
    formData.append('control_id', control);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documentos/', {
        method: 'POST',
        // NO poner Content-Type header manualmente cuando se usa FormData,
        // el navegador lo pone automáticamente con el "boundary" correcto.
        headers: {
          // 'Authorization': `Bearer ${token}` // Descomenta si activas seguridad en este endpoint
        },
        body: formData
      });

      if (response.ok) {
        // Éxito: Redirigir a la biblioteca
        navigate('/biblioteca');
      } else {
        alert("Error al guardar el documento");
        console.error(await response.text());
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = file && titulo && proceso;

  return (
    <div className="subir-container">
      {/* Header */}
      <header className="biblioteca-header">
        <div className="logo-nombre" onClick={() => navigate('/biblioteca')} style={{ cursor: 'pointer' }}>
          <div className="icono-logo">📚</div>
          <span className="nombre-app">ISOOne</span>
        </div>
        <nav className="nav-bar">
          <button className="nav-item" onClick={() => navigate('/biblioteca')}>Biblioteca</button>
          <button className="nav-item active">Subir Documento</button>
          <button className="nav-item" onClick={() => navigate('/chat')}>Chat</button>
          <button className="nav-item">Usuarios</button>
        </nav>
        <div className="usuario-info">
          <div className="avatar-initials">MG</div>
        </div>
      </header>

      <div className="subir-content">
        <div className="form-card">
          <h2 className="step-title">Carga de Documento</h2>
          <p className="step-desc">Sube el PDF y asigna sus controles ISO correspondientes.</p>

          {/* Area Upload */}
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" style={{ display: 'none' }} />

            {!file ? (
              <>
                <span className="upload-icon">📤</span>
                <div className="upload-text">Arrastra tu PDF aquí</div>
                <button className="btn-select-file" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                  Seleccionar
                </button>
              </>
            ) : (
              <div className="file-selected-info">
                <span>📄</span>
                <strong>{file.name}</strong>
                <span style={{ marginLeft: 'auto', cursor: 'pointer', color: '#EF4444' }} onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕</span>
              </div>
            )}
          </div>

          {/* Campos */}
          <div className="form-group">
            <label className="form-label">Título</label>
            <input type="text" className="form-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {tiposDocumento.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Control ISO Principal</label>
              <select className="form-select" value={control} onChange={(e) => setControl(e.target.value)}>
                {controlesISO.map(c => <option key={c} value={c}>A.{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Proceso</label>
            <input type="text" className="form-input" value={proceso} onChange={(e) => setProceso(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Versión</label>
            <input type="text" className="form-input" style={{ width: '100px' }} value={version} onChange={(e) => setVersion(e.target.value)} />
          </div>

          {/* Botón Guardar */}
          <div className="actions-footer">
            <button
              className={`btn-analizar ${isFormValid ? 'active' : ''}`}
              disabled={!isFormValid || loading}
              onClick={handleGuardar}
              style={{ backgroundColor: isFormValid ? '#5B43F1' : '#D1D5DB' }}
            >
              {loading ? 'Guardando...' : 'Guardar Documento'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SubirDocumento;