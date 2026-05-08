import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notes');
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        setNotas(data);
      } catch (err) {
        console.error('Erro ao buscar notas:', err);
        setNotas([]);
      }
    };
    load();
  }, []);

  const excluirNota = async (id) => {
    if (!confirm('Confirma exclusão da nota?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      setNotas((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Erro ao excluir nota:', err);
      alert('Não foi possível excluir a nota.');
    }
  };

  return (
    <div className="app">
      <h1>Notas</h1>
      <div className="notes">
        {notas.map((n) => (
          <div key={n.id} className="card">
            <h3>{n.titulo}</h3>
            <p>{n.conteudo}</p>
            <button onClick={() => excluirNota(n.id)}>🗑️ Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
