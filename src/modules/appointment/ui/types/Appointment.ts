export type AppointmentFilters = {
  q?: string;
  code?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
};

export type AppointmentMeta = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
