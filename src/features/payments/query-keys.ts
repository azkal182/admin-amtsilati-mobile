export const paymentQueryKeys = {
  all: ['payments'] as const,
  summary: () => ['payments', 'summary'] as const,
  methods: () => ['payments', 'methods'] as const,
  invoices: (search: unknown) => ['payments', 'invoices', search] as const,
  invoice: (id: number) => ['payments', 'invoice', id] as const,
  invoiceEvents: (id: number) => ['payments', 'invoice-events', id] as const,
  invoiceDeliveries: (id: number) =>
    ['payments', 'invoice-deliveries', id] as const,
  consumers: () => ['payments', 'consumers'] as const,
}
