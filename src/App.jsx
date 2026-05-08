import { useState, useEffect } from 'react'
import './App.css'

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000'

function App() {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [form, setForm] = useState({ titulo: '', conteudo: '' })
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  function mostrarSucesso(msg) {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3000)
  }

  function mostrarErro(msg) {
    setErro(msg)
    setTimeout(() => setErro(''), 4000)
  }

  async function buscarNotas() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/notas`)
      if (!res.ok) throw new Error()
      const dados = await res.json()
      setNotas(dados)
    } catch {
      mostrarErro('Não foi possível carregar as notas. Verifique se a API está online.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { buscarNotas() }, [])

  async function salvarNota(e) {
    e.preventDefault()
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      mostrarErro('Preencha o título e o conteúdo.')
      return
    }

    const url = editandoId ? `${API}/notas/${editandoId}` : `${API}/notas`
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      mostrarSucesso(editandoId ? 'Nota atualizada com sucesso!' : 'Nota criada com sucesso!')
      resetarForm()
      buscarNotas()
    } catch {
      mostrarErro('Erro ao salvar a nota.')
    }
  }

  async function excluirNota(id) {
    if (!confirm('Deseja realmente excluir esta nota?')) return
    try {
      const res = await fetch(`${API}/notas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      mostrarSucesso('Nota excluída com sucesso.')
      buscarNotas()
    } catch {
      mostrarErro('Erro ao excluir a nota.')
    }
  }

  async function toggleConcluida(nota) {
    try {
      const res = await fetch(`${API}/notas/${nota.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluida: !nota.concluida }),
      })
      if (!res.ok) throw new Error()
      mostrarSucesso(nota.concluida ? 'Marcado como pendente.' : 'Marcado como concluído.')
      buscarNotas()
    } catch {
      mostrarErro('Erro ao atualizar status da nota.')
    }
  }

  function iniciarEdicao(nota) {
    setForm({ titulo: nota.titulo, conteudo: nota.conteudo })
    setEditandoId(nota.id)
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetarForm() {
    setForm({ titulo: '', conteudo: '' })
    setEditandoId(null)
    setMostrarForm(false)
  }

  function formatarData(iso) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-icon">📝</span>
            <h1>Gerenciador de Notas</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { resetarForm(); setMostrarForm(!mostrarForm) }}
          >
            {mostrarForm ? '✕ Cancelar' : '+ Nova Nota'}
          </button>
        </div>
      </header>

      <main className="main">
        {sucesso && <div className="alerta alerta-sucesso">✓ {sucesso}</div>}
        {erro    && <div className="alerta alerta-erro">✕ {erro}</div>}

        {mostrarForm && (
          <section className="card form-card">
            <h2>{editandoId ? '✏️ Editar Nota' : '➕ Nova Nota'}</h2>
            <form onSubmit={salvarNota}>
              <div className="campo">
                <label htmlFor="titulo">Título</label>
                <input
                  id="titulo"
                  type="text"
                  placeholder="Título da nota"
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div className="campo">
                <label htmlFor="conteudo">Conteúdo</label>
                <textarea
                  id="conteudo"
                  rows={5}
                  placeholder="Escreva sua nota aqui..."
                  value={form.conteudo}
                  onChange={e => setForm({ ...form, conteudo: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editandoId ? 'Salvar alterações' : 'Criar nota'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={resetarForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="lista-section">
          <div className="lista-header">
            <h2>Minhas Notas <span className="badge">{notas.length}</span></h2>
          </div>

          {loading && <p className="info-text">Carregando...</p>}

          {!loading && notas.length === 0 && (
            <div className="vazio">
              <span>📭</span>
              <p>Nenhuma nota ainda. Crie a primeira!</p>
            </div>
          )}

          <div className="grid">
            {notas.map(nota => (
              <article key={nota.id} className={`card nota-card ${nota.concluida ? 'concluida' : ''}`}>
                <div className="nota-header">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={nota.concluida || false}
                      onChange={() => toggleConcluida(nota)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                  </label>
                  <h3 className="nota-titulo">{nota.titulo}</h3>
                </div>
                <p className="nota-conteudo">{nota.conteudo}</p>
                <div className="nota-meta">
                  <small>Criado: {formatarData(nota.criadoEm)}</small>
                  {nota.atualizadoEm !== nota.criadoEm && (
                    <small>Editado: {formatarData(nota.atualizadoEm)}</small>
                  )}
                </div>
                <div className="nota-acoes">
                  <button className="btn btn-outline" onClick={() => iniciarEdicao(nota)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => excluirNota(nota.id)}>
                    🗑️ Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
