// Metadata configuration for all pages
import type { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: 'Shipsy - Modern Shipment Management',
  description: 'A comprehensive shipment management system built with Next.js 15, TypeScript, and PostgreSQL.',
  keywords: ['shipment tracking', 'logistics', 'shipping', 'management system'],
  authors: [{ name: 'Shipsy Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export const generatePageMetadata = (title: string, description?: string): Metadata => ({
  title: `${title} | Shipsy`,
  description: description || defaultMetadata.description,
});
