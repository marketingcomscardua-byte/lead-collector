import React, { useState } from 'react';
import { Event } from '../types/event';
import { Plus, Edit2, Calendar, MapPin, Check, Play, Square, FileText } from 'lucide-react';
import { formatDateOnly } from '../utils/dateFormat';

interface EventsProps {
  events: Event[];
  activeEventId: string;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (id: string, event: Partial<Event>) => void;
  onSetActiveEvent: (id: string) => void;
}

export const Events: React.FC<EventsProps> = ({
  events,
  activeEventId,
  onAddEvent,
  onUpdateEvent,
  onSetActiveEvent
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Event['status']>('future');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setName(event.name);
    setLocation(event.location);
    setStartDate(event.startDate);
    setEndDate(event.endDate);
    setStatus(event.status);
    setNotes(event.notes || '');
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setStatus('future');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location.trim() || !startDate || !endDate) {
      setError('Todos os campos obrigatórios (*) devem ser preenchidos.');
      return;
    }

    const eventData = {
      name: name.trim(),
      location: location.trim(),
      startDate,
      endDate,
      status,
      notes: notes.trim()
    };

    if (editingId) {
      onUpdateEvent(editingId, eventData);
    } else {
      onAddEvent(eventData);
    }

    handleCancel();
  };

  const statusLabelMap: Record<Event['status'], string> = {
    active: 'Ativo',
    future: 'Futuro',
    completed: 'Finalizado'
  };

  return (
    <div className="events-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gerenciar Eventos</h2>
          <p className="page-subtitle">Configuração de feiras e ações comerciais</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} />
            Novo Evento
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 event-form">
          <h3 className="card-title">
            <Calendar size={20} color="var(--primary-blue)" />
            {editingId ? 'Editar Evento' : 'Cadastrar Novo Evento'}
          </h3>

          {error && <div className="error-banner mb-4">{error}</div>}

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Nome do Evento *</label>
              <input
                type="text"
                placeholder="Ex: ExpoAgro 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Local *</label>
              <input
                type="text"
                placeholder="Ex: Cariacica - ES"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">Data de Início *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data de Término *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Event['status'])}
                className="form-control"
              >
                <option value="future">Futuro (Não iniciado)</option>
                <option value="active">Ativo (Em andamento)</option>
                <option value="completed">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações / Detalhes</label>
            <textarea
              rows={2}
              placeholder="Ex: Responsável de marketing, estande número 4, maquinários em exposição..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button type="button" onClick={handleCancel} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Evento
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="grid-cols-2">
        {events.map((event) => {
          const isActive = event.id === activeEventId;
          return (
            <div key={event.id} className={`card event-card ${isActive ? 'active-context' : ''}`}>
              <div className="event-card-header">
                <div>
                  <h4 className="event-name-title">{event.name}</h4>
                  <div className="event-loc flex align-center gap-1 mt-1 text-sm text-secondary">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className={`badge badge-${event.status}`}>
                  {statusLabelMap[event.status]}
                </span>
              </div>

              <div className="event-card-body mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-secondary">Período:</span>
                  <span className="font-semibold">{formatDateOnly(event.startDate)} até {formatDateOnly(event.endDate)}</span>
                </div>
                
                {event.notes && (
                  <p className="event-notes text-sm mt-2">{event.notes}</p>
                )}
              </div>

              <div className="event-card-actions mt-4">
                <div className="flex gap-2">
                  {event.status === 'active' && !isActive && (
                    <button 
                      onClick={() => onSetActiveEvent(event.id)}
                      className="btn btn-outline btn-sm-action"
                      title="Definir como evento principal para captação"
                    >
                      <Check size={16} />
                      Usar no Coletor
                    </button>
                  )}
                  {isActive && (
                    <span className="active-badge-indicator">
                      <Play size={14} /> Coletando Leads
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(event)} className="btn-icon-only" title="Editar">
                    <Edit2 size={16} />
                  </button>
                  {event.status === 'active' && (
                    <button 
                      onClick={() => onUpdateEvent(event.id, { status: 'completed' })} 
                      className="btn-icon-only border-danger" 
                      title="Finalizar Evento"
                    >
                      <Square size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .error-banner {
          background-color: var(--danger-light);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .event-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-left: 4px solid transparent;
        }

        .event-card.active-context {
          border-left-color: var(--accent-orange);
          background-color: var(--accent-orange-light);
        }

        .event-name-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary-blue);
        }

        .event-notes {
          background-color: var(--bg-main);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .event-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        .btn-sm-action {
          min-height: 32px;
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
        }

        .active-badge-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background-color: var(--success-light);
          color: var(--success);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .btn-icon-only {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-icon-only:hover {
          background-color: var(--primary-blue-light);
          color: var(--primary-blue);
          border-color: var(--primary-blue);
        }

        .btn-icon-only.border-danger:hover {
          background-color: var(--danger-light);
          color: var(--danger);
          border-color: var(--danger);
        }
      `}</style>
    </div>
  );
};
