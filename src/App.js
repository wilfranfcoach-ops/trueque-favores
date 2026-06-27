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
            @{nodos[i].email.split("@")[1]}