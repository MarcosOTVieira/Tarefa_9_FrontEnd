import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [notas, setNotas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', conteudo: '', concluida: false });
  const [editandoId, setEditandoId] = useState(null);

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

  const iniciarEdicao = (nota) => {
    setForm({ titulo: nota.titulo || '', conteudo: nota.conteudo || '', concluida: !!nota.concluida });
    setEditandoId(nota.id);
    setShowForm(true);
  };

  const salvarNota = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        const res = await fetch(`/api/notes/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Falha ao atualizar');
        const atualizado = await res.json();
        setNotas((prev) => prev.map((n) => (n.id === atualizado.id ? atualizado : n)));
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Falha ao criar');
        const nova = await res.json();
        setNotas((prev) => [nova, ...prev]);
      }
      setForm({ titulo: '', conteudo: '', concluida: false });
      setEditandoId(null);
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

  const toggleConcluida = async (id, estadoAtual) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluida: !estadoAtual }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar conclusão');
      const atualizado = await res.json();
      setNotas((prev) => prev.map((n) => (n.id === atualizado.id ? atualizado : n)));
    } catch (err) {
      console.error('Erro ao trocar conclusão:', err);
      alert('Não foi possível atualizar o status.');
    }
  };

  return (
    <div className="app">
      <h1>Notas</h1>

      <button onClick={() => { setShowForm((s) => !s); setEditandoId(null); setForm({ titulo: '', conteudo: '', concluida: false }); }}>
        {showForm ? 'Cancelar' : '+ Nova Nota'}
      </button>

      {showForm && (
        <form onSubmit={salvarNota} className="note-form">
          <h2>{editandoId ? 'Editar nota' : 'Nova nota'}</h2>
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
          <label className="round-checkbox-label">
            <input
              className="round-checkbox-input"
              type="checkbox"
              checked={form.concluida}
              onChange={(e) => setForm({ ...form, concluida: e.target.checked })}
            />
            <span className="round-checkbox" />
            Concluída
          </label>
          <button type="submit">Salvar</button>
        </form>
      )}

      <div className="notes">
        {notas.map((n) => (
          <div key={n.id} className={`card ${n.concluida ? 'done' : ''}`}>
            <div className="card-left">
              <label className="round-checkbox-label">
                <input
                  className="round-checkbox-input"
                  type="checkbox"
                  checked={!!n.concluida}
                  onChange={() => toggleConcluida(n.id, !!n.concluida)}
                />
                <span className="round-checkbox" />
              </label>
              <div className="card-content">
                <h3>{n.titulo}</h3>
                <p>{n.conteudo}</p>
              </div>
            </div>

            <div className="card-actions">
              <button onClick={() => iniciarEdicao(n)}>✏️ Editar</button>
              <button onClick={() => excluirNota(n.id)}>🗑️ Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
