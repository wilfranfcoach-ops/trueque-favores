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

// Convierte la llave VAPID pública (base64) al formato binario que pide el navegador
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Genera una "firma" única por red para poder comparar si ya la habíamos visto antes
function firmaRed(r) {
  return `${r.necesita}::${r.red.map(p => p.email).sort().join(",")}`;
}

// Compara las redes actuales contra las que ya vimos (guardadas en este dispositivo),
// actualiza el badge del ícono de la PWA (como el punto de WhatsApp) y devuelve cuántas son nuevas.
function actualizarBadge(redesActuales, emailUsuario) {
  try {
    const key = `redes_vistas_${emailUsuario}`;
    const vistasPrevias = JSON.parse(localStorage.getItem(key) || "[]");
    const firmasActuales = redesActuales.map(firmaRed);
    const nuevas = firmasActuales.filter(f => !vistasPrevias.includes(f));

    if (nuevas.length > 0 && "setAppBadge" in navigator) {
      navigator.setAppBadge(nuevas.length).catch(() => {});
    } else if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }

    localStorage.setItem(key, JSON.stringify(firmasActuales));
    return nuevas.length;
  } catch (err) {
    console.error(err);
    return 0;
  }
}

function AppContenido() {
  const { user } = useUser();
  const [ofrece, setOfrece] = useState("");
  const [necesita, setNecesita] = useState("");
  const [redes, setRedes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [vista, setVista] = useState("buscar");
  const [confeti, setConfeti] = useState(false);
  const [serviciosActivos, setServiciosActivos] = useState(null);
  const [buscandoAuto, setBuscandoAuto] = useState(false);
  const [redesNuevas, setRedesNuevas] = useState(0);
  const [permisoNotif, setPermisoNotif] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  // --- Opción B: teléfono manejado por nuestra propia app ---
  const [telefono, setTelefono] = useState("");
  const [telefonoInput, setTelefonoInput] = useState("");
  const [pidiendoTelefono, setPidiendoTelefono] = useState(false);
  const [guardandoTelefono, setGuardandoTelefono] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const foto = user?.imageUrl || "";
  const nombre = user?.firstName || "";

  useEffect(() => {
    if (!email) return;
    const cargarTodo = async () => {
      setBuscandoAuto(true);
      try {
        // 1. Revisar si ya tenemos el teléfono guardado
        const resUsuario = await fetch(`${API}/usuario/${encodeURIComponent(email)}`);
        const datosUsuario = await resUsuario.json();
        if (datosUsuario.usuario && datosUsuario.usuario.telefono) {
          setTelefono(datosUsuario.usuario.telefono);
          setPidiendoTelefono(false);
        } else {
          setPidiendoTelefono(true);
        }

        // 2. Cargar servicios activos (solo para mostrarlos en pantalla)
        const resServicios = await fetch(`${API}/mis-servicios/${encodeURIComponent(email)}`);
        const datosServicios = await resServicios.json();
        const activos = datosServicios.servicios?.filter(s => s.estado === "activo") || [];
        setServiciosActivos(activos);

        // 3. Buscar TODAS las redes disponibles para cualquiera de mis servicios activos
        if (activos.length > 0) {
          const resRedes = await fetch(`${API}/mis-redes/${encodeURIComponent(email)}`);
          const datosRedes = await resRedes.json();
          if (datosRedes.redes && datosRedes.redes.length > 0) {
            setRedes(datosRedes.redes);
            const nuevas = actualizarBadge(datosRedes.redes, email);
            setRedesNuevas(nuevas);
            if (nuevas > 0) {
              setConfeti(true);
              setTimeout(() => setConfeti(false), 4000);
            }
          } else {
            setMensaje("Tus servicios están activos. Aún no hay red disponible.");
          }
        }
      } catch (err) {
        console.error(err);
      }
      setBuscandoAuto(false);
    };
    cargarTodo();
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  const activarNotificaciones = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Tu navegador no soporta notificaciones push.");
        return;
      }
      const permiso = await Notification.requestPermission();
      setPermisoNotif(permiso);
      if (permiso !== "granted") return;

      const resKey = await fetch(`${API}/vapid-public-key`);
      const { publicKey } = await resKey.json();
      if (!publicKey) {
        console.error("El backend no tiene configurada la llave VAPID publica");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let suscripcion = await registration.pushManager.getSubscription();
      if (!suscripcion) {
        suscripcion = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      await fetch(`${API}/push-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subscription: suscripcion })
      });
    } catch (err) {
      console.error("Error activando notificaciones:", err);
    }
  };

  // Si el usuario ya había dado permiso antes, se re-suscribe silenciosamente
  // (por si el navegador rotó el token) sin volver a preguntar.
  useEffect(() => {
    if (email && permisoNotif === "granted") {
      activarNotificaciones();
    }
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  const guardarTelefono = async () => {
    if (!telefonoInput.trim()) {
      alert("Por favor ingresa tu teléfono");
      return;
    }
    setGuardandoTelefono(true);
    try {
      await fetch(`${API}/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, telefono: telefonoInput.trim(), foto, nombre })
      });
      setTelefono(telefonoInput.trim());
      setPidiendoTelefono(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el teléfono, intenta de nuevo.");
    }
    setGuardandoTelefono(false);
  };

  const buscarRed = async () => {
    if (!ofrece || !necesita) {
      alert("Por favor completa todos los campos");
      return;
    }
    setCargando(true);
    setMensaje("");
    try {
      const respuesta = await fetch(`${API}/buscar-red`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ofrece, necesita, telefono, foto, nombre }),
      });
      const datos = await respuesta.json();
      if (datos.redes && datos.redes.length > 0) {
        setRedes(datos.redes);
        const nuevas = actualizarBadge(datos.redes, email);
        setRedesNuevas(nuevas);
        setConfeti(true);
        setTimeout(() => setConfeti(false), 4000);
      } else {
        setRedes([]);
        setMensaje("No se encontro red por ahora. Tu perfil fue guardado.");
      }
      setOfrece("");
      setNecesita("");
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 8 }}>
          <UserButton />
          <button onClick={() => setVista("panel")} style={{ fontSize: "0.8rem", padding: "4px 12px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", background: "white" }}>
            Mis servicios
          </button>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span style={{ fontSize: "1.3rem" }}>🔔</span>
            {redesNuevas > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: "#e94560", color: "white", borderRadius: "50%",
                width: 18, height: 18, fontSize: "0.7rem", fontWeight: "bold",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid white"
              }}>
                {redesNuevas}
              </span>
            )}
          </div>
        </div>
      </div>

      {permisoNotif === "default" && (
        <div className="card" style={{ textAlign: "center", background: "#eef4ff", border: "1px solid #0f346033" }}>
          <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#444" }}>
            🔔 Activa las notificaciones para enterarte al instante cuando se forme una red, aunque tengas la app cerrada.
          </p>
          <button
            className="btn-primary"
            onClick={activarNotificaciones}
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
          >
            Activar notificaciones
          </button>
        </div>
      )}

      {pidiendoTelefono && (
        <div className="card" style={{ border: "1px solid #f5a62355", background: "#fff8e6" }}>
          <h2>Completa tu perfil</h2>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            Necesitamos tu teléfono para que puedan contactarte cuando se forme una red. Solo se pide una vez.
          </p>
          <input
            type="text"
            placeholder="Ej: +57 300 123 4567"
            value={telefonoInput}
            onChange={e => setTelefonoInput(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={guardarTelefono}
            disabled={guardandoTelefono}
            style={{ marginTop: 8 }}
          >
            {guardandoTelefono ? "Guardando..." : "Guardar teléfono"}
          </button>
        </div>
      )}

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
        {cargando ? "Buscando..." : "Agregar y buscar redes"}
      </button>
      {mensaje && <p style={{ color: "#666", textAlign: "center" }}>{mensaje}</p>}
      {redes && redes.length > 0 && (
        <div className="red-resultado">
          <h2>🎉 {redes.length === 1 ? "Red encontrada" : `${redes.length} redes encontradas`}!</h2>
          {redes.map((r, i) => (
            <div key={i} className="card">
              <p style={{ margin: 0, fontWeight: "bold" }}>Para lo que necesitas: {r.necesita}</p>
              <p style={{ margin: "4px 0 12px", fontSize: "0.85rem", color: "#666" }}>
                Red de {r.red.length} personas
              </p>
              <RedCircular nodos={r.red} />
            </div>
          ))}
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