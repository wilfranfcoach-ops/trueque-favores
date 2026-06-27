import { useState } from 'react';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

function RedCircular({ nodos }) {
  if (!nodos || nodos.length === 0) return null;
  const cx = 200, cy = 200, r = 130, rNodo = 44;
  const colores = ["#0f3460", "#e94560", "#533483", "#1a7a4a"];
  const total = nodos.length;
  const posiciones = nodos.map((_, i) => {
    const angulo = (2 * Math.PI * i) / total - Math.PI / 2;
    return { x: cx + r * Math.cos(angulo), y: cy + r * Math.sin(angulo) };
  });
  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: 420 }}>
      {posiciones.map((pos, i) => {
        const sig = posiciones[(i + 1) % total];
        return <line key={i} x1={pos.x} y1={pos.y} x2={sig.x} y2={sig.y} stroke="#cbd5e0" strokeWidth="2" strokeDasharray="6 3" />;
      })}
      {posiciones.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={rNodo + 3} fill="white" stroke={colores[i % colores.length]} strokeWidth="2" opacity="0.3" />
          <circle cx={pos.x} cy={pos.y} r={rNodo} fill={colores[i % colores.length]} />
          <text x={pos.x} y={pos.y - 10} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
            {nodos[i].servicio.length > 12 ? nodos[i].servicio.slice(0, 12) + "..." : nodos[i].servicio}
          </text>
          <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill="white" fontSize="7.5" opacity="0.85">
            {nodos[i].email.split("@")[0]}
          </text>
          <text x={pos.x} y={pos.y + 19} textAnchor="middle" fill="white" fontSize="7" opacity="0.7">
            {"@" + nodos[i].email.split("@")[1]}
          </text>
        </g>
      ))}
      <text x={cx} y={cy} textAnchor="middle" fontSize="28">🔄</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="10" fill="#666">red cerrada</text>
    </svg>
  );
}

function AppContenido() {
  const { user } = useUser();
  const [ofrece, setOfrece] = useState("");
  const [necesita, setNecesita] = useState("");
  const [red, setRed] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const email = user?.primaryEmailAddress?.emailAddress || "";

  const buscarRed = async () => {
    if (!ofrece || !necesita) {
      alert("Por favor completa todos los campos");
      return;
    }
    setCargando(true);
    setMensaje("");
    setRed(null);
    try {
      const respuesta = await fetch("https://trueque-favores-production.up.railway.app/buscar-red", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ofrece, necesita }),
      });
      const datos = await respuesta.json();
      if (datos.encontrada) {
        setRed(datos.red);
      } else {
        setMensaje("No se encontro red por ahora. Tu perfil fue guardado.");
      }
    } catch (error) {
      setMensaje("Error conectando con el servidor.");
    }
    setCargando(false);
  };

  return (
    <main className="main">
      <div className="card" style={{ textAlign: "center" }}>
        <p>Hola, <strong>{user?.firstName || email}</strong></p>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>{email}</p>
        <UserButton />
      </div>
      <div className="card">
        <h2>Que ofreces?</h2>
        <input type="text" placeholder="Ej: Barberia, Diseno..." value={ofrece} onChange={e => setOfrece(e.target.value)} />
      </div>
      <div className="card">
        <h2>Que necesitas?</h2>
        <input type="text" placeholder="Ej: Plomeria, Vendedor..." value={necesita} onChange={e => setNecesita(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={buscarRed} disabled={cargando}>
        {cargando ? "Buscando..." : "Buscar red de trueque"}
      </button>
      {mensaje && <p style={{ color: "#666", textAlign: "center" }}>{mensaje}</p>}
      {red && (
        <div className="red-resultado">
          <h2>Red encontrada!</h2>
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