import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VerDocumento.css';

function VerDocumento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para la IA
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await fetch(`/api/documentos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDoc(data);
          
          // Simulamos análisis de IA
          setTimeout(() => {
             generarAnalisisIA(data); 
          }, 1500);
        }
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const generarAnalisisIA = (documento) => {
    if (documento.tipo === 'Politica') {
        setAiAnalysis({
            status: 'warning',
            mensaje: 'Riesgo de Auditoría detectado.',
            detalle: `Esta Política menciona controles del anexo A.${documento.controles[0] || 'X'}, pero no se encontró evidencia técnica (Procedimientos) vinculada.`,
            accion: 'Generar Borrador de Procedimiento'
        });
    } else {
        setAiAnalysis({
            status: 'success',
            mensaje: 'Cumplimiento Normativo',
            detalle: 'El documento cubre correctamente los requisitos del control asignado.',
            accion: null
        });
    }
  };

  if (loading) return <div className="loading">Cargando documento...</div>;
  if (!doc) return <div className="error">Documento no encontrado</div>;

  return (
    <div className="ver-doc-container">
      {/* Navbar */}
      <nav className="doc-navbar">
        <button onClick={() => navigate('/biblioteca')} className="btn-back">
          ← Volver a la biblioteca
        </button>
        <div style={{fontWeight: 600, color: '#333'}}>{doc.titulo}</div>
        <button className="btn-download">Descargar PDF ⬇</button>
      </nav>

      <div className="doc-layout">
        {/* IZQUIERDA: Visor de PDF Real */}
        <div className="pdf-viewer-section">
            {doc.url ? (
                <iframe 
                    // Apuntamos al backend (puerto 8000) + la ruta del archivo
                    src={`http://127.0.0.1:8000${doc.url}`}
                    title="Visor PDF"
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none', borderRadius: '8px', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
            ) : (
                <div className="pdf-placeholder">No se pudo cargar el PDF</div>
            )}
        </div>

        {/* DERECHA: Sidebar */}
        <aside className="info-sidebar">
            
            {/* SECCIÓN IA */}
            <div className="info-card ai-card">
                <div className="ai-header">
                    <span>✨ ISOOne AI Audit</span>
                </div>
                
                {!aiAnalysis ? (
                    <div style={{fontSize:'0.85rem', color:'#666'}}>Analizando cumplimiento normativo...</div>
                ) : (
                    <>
                        <div className="ai-suggestion" style={{
                            borderLeftColor: aiAnalysis.status === 'success' ? '#10B981' : '#F59E0B'
                        }}>
                            <strong>{aiAnalysis.mensaje}</strong>
                            <p style={{marginTop:'0.5rem'}}>{aiAnalysis.detalle}</p>
                        </div>
                        
                        {aiAnalysis.accion && (
                            <button className="ai-action-btn">
                                🤖 {aiAnalysis.accion}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Metadatos */}
            <div className="info-card">
                <h3>Detalles del Documento</h3>
                <div className="meta-row">
                    <span className="label">Tipo:</span>
                    <span className="value" style={{textTransform:'capitalize'}}>{doc.tipo}</span>
                </div>
                <div className="meta-row">
                    <span className="label">Versión:</span>
                    <span className="value">{doc.version}</span>
                </div>
                <div className="meta-row">
                    <span className="label">Fecha Subida:</span>
                    <span className="value">{new Date(doc.fecha).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Controles */}
            <div className="info-card">
                <h3>Controles ISO Asociados</h3>
                <div>
                    {doc.controles.map(c => (
                        <span key={c} className="control-tag">A.{c}</span>
                    ))}
                </div>
            </div>

            {/* Traza */}
            <div className="info-card">
                <h3>Traza Documental</h3>
                <div style={{fontSize:'0.85rem', color:'#64748B'}}>
                    {doc.tipo === 'Politica' ? (
                        <>
                            <p>⬇ Faltantes detectados:</p>
                            <ul style={{paddingLeft:'1.2rem', marginTop:'0.5rem'}}>
                                <li>Procedimiento Técnico (⚠️)</li>
                                <li>Evidencia de Registro (⚠️)</li>
                            </ul>
                        </>
                    ) : (
                        <p>Documento operativo. Verifique su vinculación con la Política padre.</p>
                    )}
                </div>
            </div>

        </aside>
      </div>
    </div>
  );
}

export default VerDocumento;