export interface Event {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'future' | 'completed';
  notes?: string;
}
