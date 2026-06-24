import { Lead } from '../types/lead';
import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import { formatDateTime } from '../utils/dateFormat';

export const exportLeadsToCSV = (
  leads: Lead[],
  events: Event[],
  sellers: Seller[],
  products: Product[]
): void => {
  // Define columns
  const headers = [
    'Data',
    'Evento',
    'Nome',
    'Telefone',
    'Estado',
    'Cidade',
    'Vendedor',
    'Produtos',
    'Observacao',
    'Status'
  ];

  const statusLabelMap: Record<string, string> = {
    novo: 'Novo',
    em_atendimento: 'Em atendimento',
    interessado: 'Interessado',
    sem_retorno: 'Sem retorno',
    convertido: 'Convertido',
    perdido: 'Perdido'
  };

  // Helper to escape fields for CSV (wraps in quotes and escapes internal quotes)
  const escapeField = (val: string): string => {
    if (!val) return '""';
    const clean = val.replace(/"/g, '""');
    return `"${clean}"`;
  };

  // Build CSV rows
  const csvRows = [headers.join(',')];

  leads.forEach((lead) => {
    const event = events.find((e) => e.id === lead.eventId)?.name || 'Evento Desconhecido';
    const seller = sellers.find((s) => s.id === lead.sellerId)?.name || 'Vendedor Desconhecido';
    const mappedProducts = lead.productIds
      .map((pid) => products.find((p) => p.id === pid)?.name || '')
      .filter(Boolean)
      .join('; ');

    const row = [
      escapeField(formatDateTime(lead.createdAt)),
      escapeField(event),
      escapeField(lead.name),
      escapeField(lead.phone),
      escapeField(lead.state),
      escapeField(lead.city),
      escapeField(seller),
      escapeField(mappedProducts),
      escapeField(lead.notes || ''),
      escapeField(statusLabelMap[lead.status] || lead.status)
    ];

    csvRows.push(row.join(','));
  });

  // Add BOM (Byte Order Mark) for Excel compatibility with UTF-8 characters (like accents)
  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `leads_comercial_scardua_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
