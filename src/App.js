import { useState, useEffect } from 'react';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const API = "https://trueque-favores-production.up.railway.app";

function Confeti() {
  const piezas = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#e94560", "#0f3460", "#533483", "#1a7a4a", "#f5a623", "#50e3c2"][Math.floor(Math.random() * 6)],
    delay: Math.random() * 2,
    size: Math.random() * 8 + 6
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {piezas.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`,
          top: "-20px",
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `caer 3s ${p.delay}s ease-in forwards`
        }} />
      ))}
      <style>{`
        @keyframes caer {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function RedCircular({ nodos }) {
  if (!nodos || nodos.length === 0) return null;
  const cx = 200, cy = 210, r = 140, rNodo = 42;
  const colores = ["#0f3460", "#e94560", "#533483", "#1a7a4a"];
  const total = nodos.length;
  const posiciones = nodos.map((_, i) => {
    const angulo = (2 * Math.PI * i) / total - Math.PI / 2;
    return { x: cx + r * Math.cos(angulo), y: cy + r * Math.sin(angulo) };
  });
  return (
    <svg viewBox="0 0 400 430" width="100%" style={{ maxWidth: 420 }}>
      {posiciones.map((pos, i) => {
        const sig = posiciones[(i + 1) % total];
        return <line key={i} x1={pos.x} y1={pos.y} x2={sig.x} y2={sig.y} stroke="#cbd5e0" strokeWidth="2" strokeDasharray="6 3" />;
      })}
      {posiciones.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={rNodo + 3} fill="white" stroke={colores[i % colores.length]} strokeWidth="2" opacity="0.3" />
          <circle cx={pos.x} cy={pos.y} r={rNodo} fill={colores[i % colores.length]} />
          {nodos[i].foto && (
            <>
              <clipPath id={`clip-${i}`}>
                <circle cx={pos.x} cy={pos.y - 14} r={13} />
              </clipPath>
              <image
                href={nodos[i].foto}
                x={pos.x - 13}
                y={pos.y - 27}
                width={26}
                height={26}
                clipPath={`url(#clip-${i})`}
              />
            </>
          )}
          <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="8.5" fontWeight="bold">
            {nodos[i].servicio.length > 12 ? nodos[i].servicio.slice(0, 12) + "..." : nodos[i].servicio}
          </text>
          <text x={pos.x} y={pos.y + 16} textAnchor="middle" fill="white" fontSize="7.5" opacity="0.9">
            {nodos[i].nombre || nodos[i].email.split("@")[0]}
          </text>
          <text x={pos.x} y={pos.y + 27} textAnchor="middle" fill="white" fontSize="7" opacity="0.7">
            {"@" + nodos[i].email.split("@")[1]}
          </text>
          <text x={pos.x} y={pos.y + 38} textAnchor="middle" fill="white" fontSize="7.5" opacity="0.9">
            {nodos[i].telefono || ""}
          </text>
        </g>
      ))}
      <text x={cx} y={cy} textAnchor="middle" fontSize="28">🔄</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="10" fill="#666">red cerrada</text>
    </svg>
  );
}

function PanelControl({ email, onVolver }) {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarServicios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/mis-servicios/${encodeURIComponent(email)}`);
      const datos = await res.json();
      setServicios(datos.servicios || []);
    } catch (err) {
      console.error(err);
    }
    setCargando(false);
  };

  useEffect(() => { cargarServicios(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiarEstado = async (id, estado) => {
    await fetch(`${API}/servicio/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado })
    });
    cargarServicios();
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    await fetch(`${API}/servicio/${id}`, { method: "DELETE" });
    cargarServicios();
  };

  const coloresEstado = {
    activo: "#1a7a4a",
    inactivo: "#888",
    en_red: "#e94560",
    completado: "#533483"
  };

  return (
    <div className="main">
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Mis servicios</h2>
        <button onClick={onVolver} style={{ background: "none", border: "1px solid #ccc", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
          ← Volver
        </button>
      </div>
      {cargando ? (
        <p style={{ textAlign: "center", color: "#666" }}>Cargando...</p>
      ) : servicios.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No tienes servicios registrados.</p>
      ) : (
        servicios.map(s => (
          <div key={s.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: "bold", textTransform: "capitalize" }}>{s.tipo}: {s.nombre}</p>
              <span style={{
                fontSize: "0.75rem",
                background: coloresEstado[s.estado] + "22",
                color: coloresEstado[s.estado],
                borderRadius: 6,
                padding: "2px 8px",
                fontWeight: "bold"
              }}>{s.estado}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {s.estado === "activo" && (
                <button onClick={() => cambiarEstado(s.id, "inactivo")} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer", background: "white" }}>
                  Pausar
                </button>
              )}
              {s.estado === "inactivo" && (
                <button onClick={() => cambiarEstado(s.id, "activo")} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 6, border: "1px solid #1a7a4a", cursor: "pointer", background: "white", color: "#1a7a4a" }}>
                  Activar
                </button>
              )}
              {s.estado === "en_red" && (
                <button onClick={() => cambiarEstado(s.id, "completado")} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 6, border: "1px solid #533483", cursor: "pointer", background: "white", color: "#533483" }}>
                  Completado
                </button>
              )}
              <button onClick={() => eliminar(s.id)} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 6, border: "1px solid #e94560", cursor: "pointer", background: "white", color: "#e94560" }}>
                Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AppContenido() {
  const { user } = useUser();
  const [ofrece, setOfrece] = useState("");
  const [necesita, setNecesita] = useState("");
  const [red, setRed] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [vista, setVista] = useState("buscar");
  const [confeti, setConfeti] = useState(false);
  const [serviciosActivos, setServiciosActivos] = useState(null);
  const [buscandoAuto, setBuscandoAuto] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const foto = user?.imageUrl || "";
  const nombre = user?.firstName || "";
  // El teléfono ya no se pide manualmente: viene del dato capturado por Clerk al registrarse.
  const telefono = user?.primaryPhoneNumber?.phoneNumber || "";

  useEffect(() => {
    if (!email) return;
    const cargarYBuscar = async () => {
      setBuscandoAuto(true);
      try {
        const res = await fetch(`${API}/mis-servicios/${encodeURIComponent(email)}`);
        const datos = await res.json();
        const activos = datos.servicios?.filter(s => s.estado === "activo") || [];
        setServiciosActivos(activos);
        const ofreceSrv = activos.find(s => s.tipo === "ofrece");
        const necesitaSrv = activos.find(s => s.tipo === "necesita");
        // Ya no se prellenan los campos del formulario (ofrece/necesita quedan vacíos al entrar).
        // La búsqueda automática en segundo plano sigue usando los servicios activos guardados.
        if (ofreceSrv && necesitaSrv) {
          const respuesta = await fetch(`${API}/buscar-red`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, ofrece: ofreceSrv.nombre, necesita: necesitaSrv.nombre, telefono, foto, nombre }),
          });
          const datos2 = await respuesta.json();
          if (datos2.encontrada) {
            setRed(datos2.red);
            setConfeti(true);
            setTimeout(() => setConfeti(false), 4000);
          } else {
            setMensaje("Tus servicios están activos. Aún no hay red disponible.");
          }
        }
      } catch (err) {
        console.error(err);
      }
      setBuscandoAuto(false);
    };
    cargarYBuscar();
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  const buscarRed = async () => {
    if (!ofrece || !necesita) {
      alert("Por favor completa todos los campos");
      return;
    }
    setCargando(true);
    setMensaje("");
    setRed(null);
    try {
      const respuesta = await fetch(`${API}/buscar-red`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ofrece, necesita, telefono, foto, nombre }),
      });
      const datos = await respuesta.json();
      if (datos.encontrada) {
        setRed(datos.red);
        setConfeti(true);
        setTimeout(() => setConfeti(false), 4000);
      } else {
        setMensaje("No se encontro red por ahora. Tu perfil fue guardado.");
      }
    } catch (error) {
      setMensaje("Error conectando con el servidor.");
    }
    setCargando(false);
  };

  if (vista === "panel") {
    return <PanelControl email={email} onVolver={() => setVista("buscar")} />;
  }

  return (
    <main className="main">
      {confeti && <Confeti />}
      <div className="card" style={{ textAlign: "center" }}>
        {foto && <img src={foto} alt="perfil" style={{ width: 56, height: 56, borderRadius: "50%", marginBottom: 8, objectFit: "cover" }} />}
        <p>Hola, <strong>{nombre || email}</strong></p>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>{email}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
          <UserButton />
          <button onClick={() => setVista("panel")} style={{ fontSize: "0.8rem", padding: "4px 12px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", background: "white" }}>
            Mis servicios
          </button>
        </div>
      </div>

      {buscandoAuto && (
        <p style={{ textAlign: "center", color: "#666" }}>🔍 Buscando redes con tus servicios activos...</p>
      )}

      {serviciosActivos && serviciosActivos.length > 0 && !buscandoAuto && (
        <div className="card" style={{ background: "#f0fdf4", border: "1px solid #1a7a4a33" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#1a7a4a", fontWeight: "bold" }}>
            ✅ Servicios activos encontrados
          </p>
          {serviciosActivos.map(s => (
            <p key={s.id} style={{ margin: "4px 0", fontSize: "0.8rem", color: "#444", textTransform: "capitalize" }}>
              • {s.tipo}: {s.nombre}
            </p>
          ))}
        </div>
      )}

      <div className="card">
        <h2>Que necesitas?</h2>
        <input type="text" placeholder="Ej: Plomeria, Vendedor..." value={necesita} onChange={e => setNecesita(e.target.value)} />
      </div>
      <div className="card">
        <h2>Que ofreces a cambio?</h2>
        <input type="text" placeholder="Ej: Barberia, Diseno..." value={ofrece} onChange={e => setOfrece(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={buscarRed} disabled={cargando}>
        {cargando ? "Buscando..." : "Buscar red de trueque"}
      </button>
      {mensaje && <p style={{ color: "#666", textAlign: "center" }}>{mensaje}</p>}
      {red && (
        <div className="red-resultado">
          <h2>🎉 Red encontrada!</h2>
          <p>Se encontro una red de {red.length} personas</p>
          <RedCircular nodos={red} />
        </div>
      )}
    </main>
  );
}

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Trueque de Favores</h1>
        <p>Conecta con tu comunidad. Intercambia servicios sin dinero.</p>
      </header>
      <SignedOut>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Inicia sesión para buscar tu red de trueque</p>
          <SignInButton mode="modal">
            <button className="btn-primary">Iniciar sesión / Registrarse</button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <AppContenido />
      </SignedIn>
    </div>
  );
}

export default App;