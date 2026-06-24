import { Lead } from '../types/lead';
import { unmaskPhone } from './phoneMask';

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const digits = unmaskPhone(phone);
  return digits.length === 10 || digits.length === 11;
};

export const isDuplicateLead = (
  leads: Lead[],
  phone: string,
  eventId: string,
  excludeLeadId?: string
): boolean => {
  const cleanPhone = unmaskPhone(phone);
  if (!cleanPhone || !eventId) return false;

  return leads.some(
    (lead) =>
      unmaskPhone(lead.phone) === cleanPhone &&
      lead.eventId === eventId &&
      lead.id !== excludeLeadId
  );
};
