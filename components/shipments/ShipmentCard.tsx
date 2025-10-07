'use client';

import React from 'react';
import { Button } from '../ui';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  type: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL';
  mode: 'AIR' | 'WATER' | 'LAND';
  isDelivered: boolean;
  estimatedDeliveryDate: string | null;
  deliveryDate?: string | null;
}

export interface ShipmentCardProps {
  shipment: Shipment;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({
  shipment,
  onView,
  onEdit,
  onDelete,
  onMarkDelivered,
}) => {
  const getTypeColor = (type: string) => {
    if (type === 'LOCAL') return 'bg-blue-100 text-blue-800';
    if (type === 'NATIONAL') return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800'; // INTERNATIONAL
  };

  const getModeIcon = (mode: string) => {
    const icons = {
      AIR: '✈️',
      WATER: '🚢',
      LAND: '🚚',
    };
    return icons[mode as keyof typeof icons] || '📦';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getModeIcon(shipment.mode)}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {shipment.trackingNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {shipment.origin} → {shipment.destination}
            </p>
          </div>
        </div>
        
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            shipment.isDelivered
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {shipment.isDelivered ? 'Delivered' : 'Pending'}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(shipment.type)}`}>
            {shipment.type.charAt(0).toUpperCase() + shipment.type.slice(1)}
          </span>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Mode</p>
          <p className="text-sm font-medium text-gray-900 capitalize">{shipment.mode}</p>
        </div>
        
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1">
            {shipment.isDelivered ? 'Delivered On' : 'Estimated Delivery'}
          </p>
          <p className="text-sm font-medium text-gray-900">
            {shipment.isDelivered && shipment.deliveryDate
              ? formatDate(shipment.deliveryDate)
              : formatDate(shipment.estimatedDeliveryDate)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {onView && (
          <Button size="sm" variant="outline" onClick={() => onView(shipment.id)}>
            View
          </Button>
        )}
        {onEdit && !shipment.isDelivered && (
          <Button size="sm" variant="outline" onClick={() => onEdit(shipment.id)}>
            Edit
          </Button>
        )}
        {onMarkDelivered && !shipment.isDelivered && (
          <Button size="sm" variant="primary" onClick={() => onMarkDelivered(shipment.id)}>
            Mark Delivered
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="danger" onClick={() => onDelete(shipment.id)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShipmentCard;
