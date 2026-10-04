export const appointmentRoutes = {
  index: (companyId: string, search?: Record<string, any>) => {
    const url = new URL(`/${companyId}/appointments`, 'http://localhost');
    if (search) {
      Object.entries(search).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value));
      });
    }
    return url.pathname + url.search;
  },
  create: (companyId: string) => `/${companyId}/appointments/create`,
  edit: (companyId: string, id: string) => `/${companyId}/appointments/${id}/edit`,
};
