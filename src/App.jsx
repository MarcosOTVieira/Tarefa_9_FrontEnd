import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [notas, setNotas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', conteudo: '', concluida: false });

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

  const salvarNota = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      const nova = await res.json();
      setNotas((prev) => [nova, ...prev]);
      setForm({ titulo: '', conteudo: '', concluida: false });
      setShowForm(false);
    } catch (err) {
      console.error('Erro ao salvar nota:', err);
      alert('Não foi possível salvar a nota.');
    }
  };

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

      <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancelar' : '+ Nova Nota'}</button>

      {showForm && (
        <form onSubmit={salvarNota} className="note-form">
          <input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
          <textarea
            placeholder="Conteúdo"
            value={form.conteudo}
            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={form.concluida}
              onChange={(e) => setForm({ ...form, concluida: e.target.checked })}
            />{' '}
            Concluída
          </label>
          <button type="submit">Salvar</button>
        </form>
      )}

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
