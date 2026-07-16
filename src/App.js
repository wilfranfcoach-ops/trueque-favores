import { useState, useEffect } from 'react';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const API = "https://trueque-favores-production.up.railway.app";

const CIUDADES = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
  "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Cúcuta",
  "Ibagué", "Villavicencio", "Pasto", "Armenia", "Neiva", "Otra"
];

const FRASES_MOTIVADORAS = [
  "Hoy alguien necesita exactamente lo que tú sabes hacer.",
  "No mides tu talento en pesos. Lo mides en el tiempo que estás dispuesto a dar.",
  "Servir no te hace menos. Te hace parte de algo más grande.",
  "La confianza no se compra. Se construye, un intercambio a la vez.",
  "¿Y si hoy dieras tu tiempo sin pensar en lo que recibes a cambio?",
  "Un día de tu talento puede cambiar el día de alguien más.",
  "En Trueque no preguntamos '¿cuánto cuesta?'. Preguntamos '¿cuánto tiempo tienes para dar?'",
  "Cada red que activas es una historia de dos personas que decidieron confiar."
];

function FraseMotivadora() {
  const [indice, setIndice] = useState(() => Math.floor(Math.random() * FRASES_MOTIVADORAS.length));

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice(i => (i + 1) % FRASES_MOTIVADORAS.length);
    }, 15000); // cambia cada 15 segundos
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="card" style={{
      textAlign: "center",
      background: "linear-gradient(135deg, #0f3460 0%, #1a7a4a 100%)",
      color: "white"
    }}>
      <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.75, letterSpacing: 1, textTransform: "uppercase" }}>
        Cultura Trueque
      </p>
      <p style={{ margin: "6px 0 0", fontSize: "0.95rem", fontStyle: "italic", lineHeight: 1.4 }}>
        "{FRASES_MOTIVADORAS[indice]}"
      </p>
    </div>
  );
}

function Confeti() {
  const piezas = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#e94560", "#0f3460", "#533483", "#1a7a4a", "#f5a623", "#50e3c2"][Math.floor(Math.random() * 6)],
    delay: Math.random() * 2,
    size: Math.random() * 8 + 6
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2000 }}>
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

function RedCircular({ nodos, pagado, onTocarNodo }) {
  if (!nodos || nodos.length === 0) return null;
  const cx = 220, cy = 230, r = 155, rNodo = 58;
  const colores = ["#0f3460", "#e94560", "#533483", "#1a7a4a"];
  const total = nodos.length;
  const posiciones = nodos.map((_, i) => {
    const angulo = (2 * Math.PI * i) / total - Math.PI / 2;
    return { x: cx + r * Math.cos(angulo), y: cy + r * Math.sin(angulo) };
  });
  return (
    <svg viewBox="0 0 440 470" width="100%" style={{ maxWidth: 460 }}>
      {posiciones.map((pos, i) => {
        const sig = posiciones[(i + 1) % total];
        return <line key={i} x1={pos.x} y1={pos.y} x2={sig.x} y2={sig.y} stroke="#cbd5e0" strokeWidth="2.5" strokeDasharray="7 4" />;
      })}
      {posiciones.map((pos, i) => (
        <g
          key={i}
          onClick={() => onTocarNodo && onTocarNodo(nodos[i], i)}
          style={{ cursor: onTocarNodo ? "pointer" : "default" }}
        >
          <circle cx={pos.x} cy={pos.y} r={rNodo + 4} fill="white" stroke={colores[i % colores.length]} strokeWidth="2.5" opacity="0.3" />
          <circle cx={pos.x} cy={pos.y} r={rNodo} fill={colores[i % colores.length]} />
          {nodos[i].foto ? (
            <>
              <clipPath id={`clip-${i}`}>
                <circle cx={pos.x} cy={pos.y - 14} r={24} />
              </clipPath>
              <image
                href={nodos[i].foto}
                x={pos.x - 24}
                y={pos.y - 38}
                width={48}
                height={48}
                clipPath={`url(#clip-${i})`}
              />
            </>
          ) : (
            <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="26">🙂</text>
          )}
          <text x={pos.x} y={pos.y + 24} textAnchor="middle" fill="white" fontSize="11.5" fontWeight="bold">
            {(nodos[i].nombre || nodos[i].email.split("@")[0]).length > 12
              ? (nodos[i].nombre || nodos[i].email.split("@")[0]).slice(0, 12) + "…"
              : (nodos[i].nombre || nodos[i].email.split("@")[0])}
          </text>
          {i === 0 ? (
            <text x={pos.x} y={pos.y + 37} textAnchor="middle" fill="white" fontSize="8" opacity="0.85">(tú)</text>
          ) : i === 1 ? (
            <text x={pos.x} y={pos.y + 37} textAnchor="middle" fill="white" fontSize="8" opacity="0.9">
              {pagado ? "👉 ver contacto" : "🔒 pagar"}
            </text>
          ) : (
            <text x={pos.x} y={pos.y + 37} textAnchor="middle" fill="white" fontSize="7" opacity="0.75">
              no es tu contacto
            </text>
          )}
        </g>
      ))}
      <text x={cx} y={cy} textAnchor="middle" fontSize="30">🔄</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="10" fill="#666">red cerrada</text>
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
    ejecutado: "#0f3460"
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
                <button onClick={() => cambiarEstado(s.id, "ejecutado")} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 6, border: "1px solid #0f3460", cursor: "pointer", background: "white", color: "#0f3460" }}>
                  ✅ Ya lo presté
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
  const [confetiKey, setConfetiKey] = useState(0);
  const [buscandoAuto, setBuscandoAuto] = useState(false);
  const [redesNuevas, setRedesNuevas] = useState(0);
  const [contactoActivo, setContactoActivo] = useState(null);
  const [reputacionContacto, setReputacionContacto] = useState(null);
  const [mostrarFormCalificacion, setMostrarFormCalificacion] = useState(false);
  const [estrellasForm, setEstrellasForm] = useState(0);
  const [comentarioForm, setComentarioForm] = useState("");
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);
  const [yaCalifico, setYaCalifico] = useState(false);
  const [permisoNotif, setPermisoNotif] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  // --- Opción B: teléfono manejado por nuestra propia app ---
  const [telefono, setTelefono] = useState("");
  const [telefonoInput, setTelefonoInput] = useState("");
  const [pidiendoTelefono, setPidiendoTelefono] = useState(false);
  const [guardandoTelefono, setGuardandoTelefono] = useState(false);
  
  const [ciudad, setCiudad] = useState("");
  const [ciudadInput, setCiudadInput] = useState("");
  const [pidiendoCiudad, setPidiendoCiudad] = useState(false);

  const [ofreceRemoto, setOfreceRemoto] = useState(false);
  // --- Minilibro de filosofia Trueque (se muestra 1 sola vez, al primer ingreso) ---
  const [mostrarMinilibro, setMostrarMinilibro] = useState(false);

  // --- Instrucciones "Cómo funciona", siempre accesibles desde un botón ---
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);

  // --- Política de Uso y Convivencia: debe aceptarse antes de poder usar la app ---
  const [politicaAceptada, setPoliticaAceptada] = useState(null); // null = aun no se sabe, true/false luego
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const [checkPolitica, setCheckPolitica] = useState(false);
  const [guardandoPolitica, setGuardandoPolitica] = useState(false);

  // --- Verificación de identidad (foto de cédula o selfie) para poder activar redes ---
  const [estadoVerificacion, setEstadoVerificacion] = useState("sin_verificar"); // sin_verificar | pendiente | aprobada | rechazada
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);
  const [archivoVerificacion, setArchivoVerificacion] = useState(null);
  const [subiendoVerificacion, setSubiendoVerificacion] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const foto = user?.imageUrl || "";
  const nombre = user?.firstName || "";

  useEffect(() => {
    if (!email) return;
    const yaVisto = localStorage.getItem(`minilibro_visto_${email}`);
    if (!yaVisto) {
      setMostrarMinilibro(true);
    }
  }, [email]);

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
          if (datosUsuario.usuario && datosUsuario.usuario.ciudad) {
          setCiudad(datosUsuario.usuario.ciudad);
          setPidiendoCiudad(false);
        } else {
          setPidiendoCiudad(true);
        }

        const aceptoPolitica = !!datosUsuario.usuario?.acepto_politica;
        setPoliticaAceptada(aceptoPolitica);
        if (!aceptoPolitica) setMostrarPolitica(true);

        setEstadoVerificacion(datosUsuario.usuario?.verificacion_estado || "sin_verificar");

        // 2. Cargar servicios activos (para saber si vale la pena buscar redes)
        const resServicios = await fetch(`${API}/mis-servicios/${encodeURIComponent(email)}`);
        const datosServicios = await resServicios.json();
        const activos = datosServicios.servicios?.filter(s => s.estado === "activo") || [];

        // 3. Buscar TODAS las redes disponibles para cualquiera de mis servicios activos
        if (activos.length > 0) {
          const resRedes = await fetch(`${API}/mis-redes/${encodeURIComponent(email)}`);
          const datosRedes = await resRedes.json();
          if (datosRedes.redes && datosRedes.redes.length > 0) {
            setRedes(datosRedes.redes);
            const nuevas = actualizarBadge(datosRedes.redes, email);
            setRedesNuevas(nuevas);
            if (nuevas > 0) {
              setConfetiKey(k => k + 1);
              setConfeti(true);
              setTimeout(() => setConfeti(false), 4500);
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

  const cerrarMinilibro = () => {
    localStorage.setItem(`minilibro_visto_${email}`, "1");
    setMostrarMinilibro(false);
  };

  const aceptarPolitica = async () => {
    if (!checkPolitica) return;
    setGuardandoPolitica(true);
    try {
      await fetch(`${API}/aceptar-politica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setPoliticaAceptada(true);
      setMostrarPolitica(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar tu aceptación, intenta de nuevo.");
    }
    setGuardandoPolitica(false);
  };

  const subirVerificacion = async () => {
    if (!archivoVerificacion) {
      alert("Selecciona una foto (cédula o selfie) primero.");
      return;
    }
    setSubiendoVerificacion(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = reject;
        lector.readAsDataURL(archivoVerificacion);
      });
      await fetch(`${API}/verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, imagen: base64 })
      });
      setEstadoVerificacion("pendiente");
      setMostrarVerificacion(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo subir la foto, intenta de nuevo.");
    }
    setSubiendoVerificacion(false);
  };

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

  const handleTocarNodo = (r, nodo, indice) => {
    if (indice === 0) return; // es el propio usuario
    if (indice !== 1) {
      alert("Esta persona no es tu eslabón directo — su contacto se desbloquea para quien sí le presta el servicio a ella. Tú solo activas el contacto de la persona a quien TÚ le vas a prestar tu servicio.");
      return;
    }
    if (r.pagado) {
      setContactoActivo(nodo);
    } else {
      pagarRed(r);
    }
  };

  const pagarRed = (r) => {
    if (estadoVerificacion !== "aprobada") {
      setMostrarVerificacion(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/crear-pago-red`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firma: r.firma, necesita: r.necesita })
        });
        const datos = await res.json();
        if (!datos.reference) {
          alert("No se pudo iniciar el pago. Intenta de nuevo.");
          return;
        }
        if (!window.WidgetCheckout) {
          alert("El widget de pagos no cargó. Recarga la página e intenta de nuevo.");
          return;
        }
        const checkout = new window.WidgetCheckout({
          currency: datos.currency,
          amountInCents: datos.amountInCents,
          reference: datos.reference,
          publicKey: datos.publicKey,
          signature: { integrity: datos.signature },
          redirectUrl: window.location.origin + "/"
        });
        checkout.open(async (result) => {
          const transaccion = result?.transaction;
          if (transaccion?.id) {
            await confirmarPago(transaccion.id);
          }
        });
      } catch (err) {
        console.error("Error iniciando pago:", err);
      }
    })();
  };

  const confirmarPago = async (transactionId) => {
    try {
      const res = await fetch(`${API}/confirmar-pago/${transactionId}`);
      const datos = await res.json();
      if (datos.estado === "pagado") {
        const resRedes = await fetch(`${API}/mis-redes/${encodeURIComponent(email)}`);
        const datosRedes = await resRedes.json();
        setRedes(datosRedes.redes || []);
      } else if (datos.estado === "pendiente") {
        alert("Tu pago se está procesando. Espera unos segundos y recarga la página para ver los contactos.");
      } else {
        alert("El pago no se completó. Puedes intentarlo de nuevo.");
      }
    } catch (err) {
      console.error("Error confirmando pago:", err);
    }
  };

  useEffect(() => {
    if (!contactoActivo?.email) {
      setReputacionContacto(null);
      return;
    }
    setMostrarFormCalificacion(false);
    setEstrellasForm(0);
    setComentarioForm("");
    setYaCalifico(false);
    (async () => {
      try {
        const res = await fetch(`${API}/reputacion/${encodeURIComponent(contactoActivo.email)}`);
        const datos = await res.json();
        setReputacionContacto(datos);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [contactoActivo]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviarCalificacion = async () => {
    if (!estrellasForm) {
      alert("Selecciona de 1 a 5 estrellas");
      return;
    }
    setEnviandoCalificacion(true);
    try {
      await fetch(`${API}/calificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailCalifica: email,
          emailCalificado: contactoActivo.email,
          estrellas: estrellasForm,
          comentario: comentarioForm || null
        })
      });
      setYaCalifico(true);
      setMostrarFormCalificacion(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar la calificación, intenta de nuevo.");
    }
    setEnviandoCalificacion(false);
  };

  const reportarContacto = async (contacto) => {
    const motivo = window.prompt("¿Qué pasó? (ej: no se presentó, pidió dinero, comportamiento inapropiado)");
    if (!motivo) return;
    try {
      await fetch(`${API}/reportar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailReporta: email, emailReportado: contacto.email, motivo })
      });
      alert("Gracias, tu reporte fue enviado y será revisado.");
      setContactoActivo(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar el reporte, intenta de nuevo.");
    }
  };

  const guardarTelefono = async () => {
    if (pidiendoTelefono && !telefonoInput.trim()) {
      alert("Por favor ingresa tu teléfono");
      return;
    }
    if (pidiendoCiudad && !ciudadInput) {
      alert("Por favor selecciona tu ciudad");
      return;
    }
    setGuardandoTelefono(true);
    try {
      const telefonoAEnviar = pidiendoTelefono ? telefonoInput.trim() : telefono;
      await fetch(`${API}/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          telefono: telefonoAEnviar,
          foto,
          nombre,
          ciudad: pidiendoCiudad ? ciudadInput : undefined
        })
      });
      if (pidiendoTelefono) {
        setTelefono(telefonoInput.trim());
        setPidiendoTelefono(false);
      }
      if (pidiendoCiudad) {
        setCiudad(ciudadInput);
        setPidiendoCiudad(false);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar, intenta de nuevo.");
    }
    setGuardandoTelefono(false);
  };

  const buscarRed = async () => {
    if (politicaAceptada === false) {
      setMostrarPolitica(true);
      return;
    }
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
        body: JSON.stringify({ email, ofrece, necesita, telefono, foto, nombre, ciudad, ofreceRemoto }),
      });
      const datos = await respuesta.json();
      if (datos.redes && datos.redes.length > 0) {
        setRedes(datos.redes);
        const nuevas = actualizarBadge(datos.redes, email);
        setRedesNuevas(nuevas);
        setConfetiKey(k => k + 1);
        setConfeti(true);
        setTimeout(() => setConfeti(false), 4500);
      } else {
        setRedes([]);
        setMensaje("No se encontro red por ahora. Tu perfil fue guardado.");
      }
      setOfrece("");
      setNecesita("");
      setOfreceRemoto(false);
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
      {confeti && <Confeti key={confetiKey} />}

      {contactoActivo && (
        <div
          onClick={() => setContactoActivo(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(15, 52, 96, 0.6)", zIndex: 1001,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 320, width: "100%", textAlign: "center" }}
          >
            {contactoActivo.foto && (
              <img
                src={contactoActivo.foto}
                alt={contactoActivo.nombre}
                style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }}
              />
            )}
            <h3 style={{ margin: "4px 0" }}>{contactoActivo.nombre || contactoActivo.email.split("@")[0]}</h3>
            <p style={{ margin: "2px 0", fontSize: "0.85rem", color: "#666" }}>Ofrece: {contactoActivo.servicio}</p>
            <p style={{ margin: "10px 0 2px", fontSize: "0.95rem" }}>📞 {contactoActivo.telefono || "No registrado"}</p>
            <p style={{ margin: "2px 0 12px", fontSize: "0.95rem" }}>✉️ {contactoActivo.email}</p>

            {reputacionContacto && reputacionContacto.total > 0 ? (
              <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "#666" }}>
                ⭐ {reputacionContacto.promedio.toFixed(1)} ({reputacionContacto.total} {reputacionContacto.total === 1 ? "calificación" : "calificaciones"})
              </p>
            ) : (
              <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: "#999" }}>
                Aún sin calificaciones
              </p>
            )}

            <button className="btn-primary" onClick={() => setContactoActivo(null)}>Cerrar</button>

            {yaCalifico ? (
              <p style={{ marginTop: 10, fontSize: "0.85rem", color: "#1a7a4a" }}>
                ✅ ¡Gracias por calificar!
              </p>
            ) : mostrarFormCalificacion ? (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f7f9fc", border: "1px solid #eee" }}>
                <p style={{ margin: "0 0 8px", fontSize: "0.85rem", fontWeight: "bold" }}>¿Cómo estuvo el servicio?</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      onClick={() => setEstrellasForm(n)}
                      style={{ fontSize: "1.6rem", cursor: "pointer", opacity: n <= estrellasForm ? 1 : 0.3 }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <textarea
                  placeholder="Comentario (opcional)"
                  value={comentarioForm}
                  onChange={e => setComentarioForm(e.target.value)}
                  style={{ width: "100%", minHeight: 60, borderRadius: 8, border: "1px solid #ccc", padding: 8, fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                <button
                  className="btn-primary"
                  onClick={enviarCalificacion}
                  disabled={enviandoCalificacion}
                  style={{ marginTop: 8, fontSize: "0.85rem", padding: "8px 16px", width: "100%" }}
                >
                  {enviandoCalificacion ? "Enviando..." : "Enviar calificación"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarFormCalificacion(true)}
                style={{ marginTop: 8, background: "none", border: "1px solid #f5a623", color: "#b8790a", fontSize: "0.8rem", cursor: "pointer", width: "100%", padding: "8px 0", borderRadius: 8 }}
              >
                ⭐ Calificar a esta persona
              </button>
            )}

            <button
              onClick={() => reportarContacto(contactoActivo)}
              style={{ marginTop: 8, background: "none", border: "none", color: "#e94560", fontSize: "0.8rem", cursor: "pointer", width: "100%" }}
            >
              🚩 Reportar a esta persona
            </button>
          </div>
        </div>
      )}

      {!mostrarMinilibro && mostrarPolitica && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 52, 96, 0.9)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "white", borderRadius: 16, maxWidth: 480, width: "100%",
            maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
              <h2 style={{ margin: 0 }}>📋 Política de Uso y Convivencia</h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#666" }}>
                Debes leer y aceptar esto antes de usar Trueque.
              </p>
            </div>
            <div style={{ padding: "16px 20px", overflowY: "auto", fontSize: "0.85rem", color: "#333", lineHeight: 1.5 }}>
              <p><strong>1. Altruismo.</strong> Los servicios que ofrezco serán prestados de forma consciente, voluntaria y desinteresada.</p>
              <p><strong>2. Coordinación de red.</strong> Cuando se me notifique que hago parte de una red, contactaré tanto a mi llave sucesora como a mi llave predecesora para coordinar el servicio.</p>
              <p><strong>3. Rol de la plataforma y exención de responsabilidad.</strong>Entiendo que Trueque es únicamente un facilitador tecnológico que conecta usuarios y organiza redes de intercambio. No participo, superviso ni me hace responsable Trueque por la calidad, idoneidad o cumplimiento de los servicios, ni por daños, pérdidas o perjuicios derivados de un servicio coordinado a través de la plataforma, ni por la veracidad de la información de los usuarios más allá de las verificaciones básicas ofrecidas. Entiendo que el acuerdo y la ejecución del servicio ocurre directamente entre las partes, bajo su propio riesgo, y que Trueque no es parte de dicho acuerdo.</p>
              <p><strong>4. Referencia de tiempo, no de dinero.</strong> Los servicios se intercambian por tiempo dedicado, sin comparar precios ni costos. No usaré palabras como dinero, precio, plata o costo dentro de la plataforma.</p>
              <p><strong>5. Exclusividad de servicios.</strong> No usaré Trueque para ofrecer, solicitar o mediar la venta de productos, bienes materiales, ni transacciones de dinero distintas al pago simbólico de activación de red.</p>
              <p><strong>6. Edad mínima.</strong> Confirmo que soy mayor de 18 años.</p>
              <p><strong>7. Verificación.</strong> Entiendo que para activar una red puede pedírseme una foto de verificación de identidad, y que mi cuenta puede ser suspendida si mis datos no son reales.</p>
              <p><strong>8. Calificación y reportes.</strong> Después de cada servicio calificaré la experiencia. Puedo reportar a cualquier persona que incumpla, y entiendo que mi cuenta puede ser suspendida si acumulo reportes válidos o incumplimientos.</p>
              <p><strong>9. Uso indebido de contactos.</strong> No usaré los datos de contacto compartidos por Trueque para fines distintos al servicio coordinado. Hacerlo es causal de expulsión inmediata.</p>
              <p><strong>10. Responsabilidad del servicio.</strong> Después de prestar un servicio, seré responsable de eliminarlo de la app para evitar redes repetidas.</p>
            </div>
            <div style={{ padding: 16, borderTop: "1px solid #eee", background: "#f7f9fc" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checkPolitica}
                  onChange={e => setCheckPolitica(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                He leído y acepto los Compromisos y la Política de Uso y Convivencia de Trueque.
              </label>
              <button
                className="btn-primary"
                onClick={aceptarPolitica}
                disabled={!checkPolitica || guardandoPolitica}
                style={{ marginTop: 12, width: "100%" }}
              >
                {guardandoPolitica ? "Guardando..." : "Aceptar y continuar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarVerificacion && (
        <div
          onClick={() => setMostrarVerificacion(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(15, 52, 96, 0.7)", zIndex: 1002,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
          }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 340, width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>🪪 Verifica tu identidad</h3>
            {estadoVerificacion === "pendiente" ? (
              <p style={{ fontSize: "0.85rem", color: "#666" }}>
                Tu foto ya fue enviada y está en revisión. Te avisaremos cuando esté aprobada para poder activar redes.
              </p>
            ) : (
              <>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>
                  Para activar una red necesitamos confirmar que eres una persona real. Sube una foto de tu cédula o una selfie clara.
                </p>
                <input type="file" accept="image/*" onChange={e => setArchivoVerificacion(e.target.files?.[0] || null)} />
                <button className="btn-primary" onClick={subirVerificacion} disabled={subiendoVerificacion} style={{ marginTop: 10 }}>
                  {subiendoVerificacion ? "Subiendo..." : "Enviar para verificación"}
                </button>
              </>
            )}
            <button onClick={() => setMostrarVerificacion(false)} style={{ marginTop: 8, background: "none", border: "none", color: "#888", cursor: "pointer", width: "100%" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {mostrarInstrucciones && (
        <div
          onClick={() => setMostrarInstrucciones(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(15, 52, 96, 0.7)", zIndex: 1003,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: 16, maxWidth: 460, width: "100%",
              maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden"
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ margin: 0 }}>📋 Cómo funciona Trueque</h2>
              <button
                onClick={() => setMostrarInstrucciones(false)}
                aria-label="Cerrar"
                style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#999", lineHeight: 1, padding: 4 }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "16px 20px", overflowY: "auto", fontSize: "0.88rem", color: "#333", lineHeight: 1.5 }}>
              <div style={{
                position: "relative", width: "100%", maxWidth: 260, margin: "0 auto 16px",
                aspectRatio: "9 / 16", borderRadius: 12, overflow: "hidden", background: "#000"
              }}>
                <iframe
                  src="https://www.youtube.com/embed/DsGTvDqTA9o"
                  title="Cómo funciona Trueque de Favores"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p><strong>1. Ingresa tus servicios.</strong> Registra qué necesitas y qué ofreces a cambio.</p>
              <p><strong>2. Revisa tus redes con frecuencia.</strong> Nuevas cadenas pueden formarse en cualquier momento.</p>
              <p><strong>3. Cuando te llegue una red, actívala.</strong> Paga tu cuota de $5.000 COP para desbloquear el contacto de la persona a quien le vas a prestar tu servicio.</p>
              <p><strong>4. Contacta a esa persona.</strong> Coordina los detalles del servicio, y motívala a hacer lo mismo (pagar su cuota y contactar al siguiente) para que la cadena se complete.</p>
              <p><strong>5. Marca tu servicio como "Ejecutado".</strong> Una vez hayas prestado tu servicio, cambia su estado en "Mis servicios" tocando "✅ Ya lo presté".</p>
              <p><strong>6. La red se cierra sola.</strong> Cuando todos los servicios de una red están en estado "Ejecutado", se eliminan automáticamente: la red se considera completada.</p>
              <p><strong>7. Las redes inactivas se limpian solas.</strong> Las redes con más de 30 días sin ningún movimiento se eliminan automáticamente, para mantener la comunidad activa y confiable.</p>
            </div>
            <div style={{ padding: 16, borderTop: "1px solid #eee", textAlign: "center", background: "#f7f9fc" }}>
              <button className="btn-primary" onClick={() => setMostrarInstrucciones(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarMinilibro && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 52, 96, 0.85)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "white", borderRadius: 16, maxWidth: 480, width: "100%",
            maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0 }}>📖 Bienvenido a Trueque de Favores</h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#666" }}>
                  Antes de empezar, conoce nuestra filosofía y cómo funciona la comunidad.
                </p>
              </div>
              <button
                onClick={cerrarMinilibro}
                aria-label="Cerrar"
                style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#999", lineHeight: 1, padding: 4 }}
              >
                ✕
              </button>
            </div>
            <iframe
              src="/minilibro-trueque.pdf"
              title="Minilibro Trueque de Favores"
              style={{ flex: 1, width: "100%", border: "none", minHeight: 400 }}
            />
            <div style={{ padding: 16, borderTop: "1px solid #eee", textAlign: "center", background: "#f7f9fc" }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#666" }}>
                Toca el botón para volver a la app (esta ventana no se muestra de nuevo).
              </p>
              <button className="btn-primary" onClick={cerrarMinilibro}>
                Entendido, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ textAlign: "center" }}>
        {foto && <img src={foto} alt="perfil" style={{ width: 56, height: 56, borderRadius: "50%", marginBottom: 8, objectFit: "cover" }} />}
        <p>Hola, <strong>{nombre || email}</strong></p>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>{email}</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 8 }}>
          <UserButton />
          <button onClick={() => setVista("panel")} style={{ fontSize: "0.8rem", padding: "4px 12px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", background: "white" }}>
            Mis servicios
          </button>
          <button onClick={() => setMostrarInstrucciones(true)} style={{ fontSize: "0.8rem", padding: "4px 12px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", background: "white" }}>
            ❓ Cómo funciona
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

      {estadoVerificacion === "pendiente" && (
        <div className="card" style={{ textAlign: "center", background: "#fff8e6", border: "1px solid #f5a62355" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#444" }}>
            🪪 Tu verificación de identidad está en revisión. Te avisaremos cuando puedas activar redes.
          </p>
        </div>
      )}
      {estadoVerificacion === "rechazada" && (
        <div className="card" style={{ textAlign: "center", background: "#fdecec", border: "1px solid #e9456055" }}>
          <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#444" }}>
            🪪 Tu verificación no fue aprobada. Vuelve a intentarlo con una foto más clara.
          </p>
          <button className="btn-primary" onClick={() => setMostrarVerificacion(true)} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
            Volver a subir foto
          </button>
        </div>
      )}

      {(pidiendoTelefono || pidiendoCiudad) && (
        <div className="card" style={{ border: "1px solid #f5a62355", background: "#fff8e6" }}>
          <h2>Completa tu perfil</h2>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            {pidiendoTelefono && pidiendoCiudad
              ? "Necesitamos tu teléfono y tu ciudad para que puedan contactarte y hacerte match con gente cerca. Solo se pide una vez."
              : pidiendoTelefono
              ? "Necesitamos tu teléfono para que puedan contactarte cuando se forme una red. Solo se pide una vez."
              : "Necesitamos tu ciudad para poder hacerte match con gente cerca. Solo se pide una vez."}
          </p>
           {pidiendoTelefono && (
            <input
              type="text"
              placeholder="Ej: +57 300 123 4567"
              value={telefonoInput}
              onChange={e => setTelefonoInput(e.target.value)}
            />
          )}
          {pidiendoCiudad && (
            <select
              value={ciudadInput}
              onChange={e => setCiudadInput(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="">Selecciona tu ciudad</option>
              {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <button
            className="btn-primary"
            onClick={guardarTelefono}
            disabled={guardandoTelefono}
            style={{ marginTop: 8 }}
          >
            {guardandoTelefono ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}

      {buscandoAuto && (
        <p style={{ textAlign: "center", color: "#666" }}>🔍 Buscando redes con tus servicios activos...</p>
      )}

      <FraseMotivadora />

      <div className="card">
        <h2>Que necesitas?</h2>
        <input type="text" placeholder="Ej: Plomeria, Vendedor..." value={necesita} onChange={e => setNecesita(e.target.value)} />
      </div>
      <div className="card">
        <h2>Que ofreces a cambio?</h2>
        <input type="text" placeholder="Ej: Barberia, Diseno..." value={ofrece} onChange={e => setOfrece(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: "0.85rem", color: "#444", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={ofreceRemoto}
            onChange={e => setOfreceRemoto(e.target.checked)}
          />
          💻 Puedo prestar este servicio de forma remota (no requiere estar en mi ciudad)
        </label>
        {!ofreceRemoto && (
          <p style={{ fontSize: "0.78rem", color: "#888", margin: "6px 0 0" }}>
            📍 Este servicio solo hará match con personas en <strong>{ciudad || "tu ciudad"}</strong>.
          </p>
        )}
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
              <RedCircular
                nodos={r.red}
                pagado={r.pagado}
                onTocarNodo={(nodo, idx) => handleTocarNodo(r, nodo, idx)}
              />
              {r.pagado === false && (
                <div style={{
                  marginTop: 12, padding: 12, borderRadius: 10,
                  background: "#fff8e6", border: "1px solid #f5a62355", textAlign: "center"
                }}>
                  <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#444" }}>
                    🔒 Activa tu eslabón de esta red — desbloquea el contacto de la persona a quien le vas a prestar tu servicio.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => pagarRed(r)}
                    style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                  >
                    Activar mi eslabón — ${(r.precio || 5000).toLocaleString("es-CO")} COP
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function App() {
  const [promptInstalacion, setPromptInstalacion] = useState(null);
  const [appInstalada, setAppInstalada] = useState(false);

  useEffect(() => {
    const yaEsStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setAppInstalada(yaEsStandalone);

    const manejarPrompt = (e) => {
      e.preventDefault();
      setPromptInstalacion(e);
    };
    window.addEventListener("beforeinstallprompt", manejarPrompt);

    const manejarInstalada = () => {
      setAppInstalada(true);
      setPromptInstalacion(null);
    };
    window.addEventListener("appinstalled", manejarInstalada);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarPrompt);
      window.removeEventListener("appinstalled", manejarInstalada);
    };
  }, []);

  const instalarApp = async () => {
    if (!promptInstalacion) return;
    promptInstalacion.prompt();
    await promptInstalacion.userChoice;
    setPromptInstalacion(null);
  };

  const esIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  return (
    <div className="app">
      <header className="header">
        <h1>Trueque de Favores</h1>
        <p>Conecta con tu comunidad. Intercambia servicios sin dinero.</p>
      </header>

      {!appInstalada && promptInstalacion && (
        <div className="card" style={{ textAlign: "center", background: "#eef4ff", border: "1px solid #0f346033", margin: "0 16px 16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#444" }}>
            📲 Instala Trueque en tu celular para acceder más rápido y recibir notificaciones.
          </p>
          <button className="btn-primary" onClick={instalarApp} style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
            Instalar app
          </button>
        </div>
      )}

      {!appInstalada && !promptInstalacion && esIOS && (
        <div className="card" style={{ textAlign: "center", background: "#eef4ff", border: "1px solid #0f346033", margin: "0 16px 16px" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#444" }}>
            📲 Para instalar: toca el ícono de compartir <strong>⬆️</strong> en Safari y elige <strong>"Agregar a pantalla de inicio"</strong>.
          </p>
        </div>
      )}

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