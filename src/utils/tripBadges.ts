import { Trip } from '../types/travel';

export type TripType = 'pribadi' | 'shared' | 'template';
export type TripTimeStatus = 'upcoming' | 'current' | 'past';

export interface TripUserLike {
  uid?: string;
  email?: string | null;
}

export function getTripType(trip: Trip, user: TripUserLike | null): TripType {
  const isOwned = !trip.userId || (user && trip.userId === user.uid);
  if (trip.isTemplate) return 'template';
  if (isOwned) return 'pribadi';
  return 'shared';
}

export function isTemplateReadOnly(trip: Trip, user: TripUserLike | null): boolean {
  const isOwner = !!user && trip.userId === user.uid;
  const isCollaborator = (trip.collaborators || []).includes(user?.email || '');
  return !isOwner && !isCollaborator && trip.isTemplate;
}

export function getTripTimeStatus(trip: Trip): TripTimeStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = trip.startDate ? new Date(`${trip.startDate}T00:00:00`) : null;
  const end = trip.endDate ? new Date(`${trip.endDate}T00:00:00`) : null;
  if (!start) return 'upcoming';
  if (end && end.getTime() < today.getTime()) return 'past';
  if (start.getTime() > today.getTime()) return 'upcoming';
  return 'current';
}

export function getTripStatusLabel(status: TripTimeStatus): string {
  if (status === 'current') return 'Sedang Berlangsung';
  if (status === 'past') return 'Selesai';
  return 'Akan Datang';
}

export interface TripBadgeData {
  type: TripType;
  label: string;
  textClass: string;
  bgClass: string;
}

export function getBadgeData(trip: Trip, user: TripUserLike | null): TripBadgeData {
  const type = getTripType(trip, user);
  if (type === 'template') {
    return { type, label: 'Template', textClass: 'text-amber-700', bgClass: 'bg-amber-100 border-amber-200' };
  }
  if (type === 'shared') {
    return { type, label: 'Shared', textClass: 'text-purple-700', bgClass: 'bg-purple-100 border-purple-200' };
  }
  return { type, label: 'Pribadi', textClass: 'text-primary-pink', bgClass: 'bg-soft-pink border-primary-pink/20' };
}