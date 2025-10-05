'use client';

import React, { useState } from 'react';
import { Button, Input, Select, SelectOption } from '../ui';

interface ShipmentFormData {
  customerId: string;
  origin: string;
  destination: string;
  // Use server enum labels directly in the form values
  type: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL';
  mode: 'LAND' | 'AIR' | 'WATER';
  weight: number;
    cost: number;
    taxPercent: number;
    calculatedTotal: number; // total after taxes
  estimatedDeliveryDate: string;
}

export interface ShipmentFormProps {
  initialData?: Partial<ShipmentFormData>;
  customers: Array<{ id: string; name: string }>;
  onSubmit: (data: ShipmentFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({
  initialData,
  customers,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ShipmentFormData>({
    customerId: initialData?.customerId || '',
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
  // normalize any incoming initialData values to server enum labels (UPPERCASE)
  type: (initialData?.type ? (initialData.type as any).toString().toUpperCase() : 'LOCAL') as 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL',
  mode: (initialData?.mode ? (initialData.mode as any).toString().toUpperCase() : 'LAND') as 'LAND' | 'AIR' | 'WATER',
    weight: initialData?.weight || 0,
    cost: initialData?.cost || 0,
    taxPercent: initialData?.taxPercent || 0,
    calculatedTotal: initialData?.calculatedTotal || 0,
    estimatedDeliveryDate: initialData?.estimatedDeliveryDate || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShipmentFormData, string>>>({});

  const typeOptions: SelectOption[] = [
    { value: 'LOCAL', label: 'Local (Domestic)' },
    { value: 'NATIONAL', label: 'National' },
    { value: 'INTERNATIONAL', label: 'International' },
  ];

  const modeOptions: SelectOption[] = [
    { value: 'AIR', label: 'Air' },
    { value: 'WATER', label: 'Sea / Water' },
    { value: 'LAND', label: 'Land (Road / Rail)' },
  ];

  const customerOptions: SelectOption[] = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const handleChange = (field: keyof ShipmentFormData, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as ShipmentFormData;
      // Recalculate total when cost or taxPercent change
      if (field === 'cost' || field === 'taxPercent') {
        const cost = Number(next.cost) || 0;
        const tax = Number(next.taxPercent) || 0;
        next.calculatedTotal = parseFloat((cost * (1 + tax / 100)).toFixed(2));
      }
      return next;
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShipmentFormData, string>> = {};

    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    if (formData.cost <= 0) newErrors.cost = 'Cost must be greater than 0';
    if (!formData.estimatedDeliveryDate) newErrors.estimatedDeliveryDate = 'Estimated delivery date is required';
  // calculatedTotal must be present and >= cost
  if (formData.calculatedTotal <= 0) newErrors.calculatedTotal = 'Calculated total is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Build payload: do not send taxPercent, only calculatedTotal as 'calculatedTotal'
    const payload: any = {
      customerId: formData.customerId,
      origin: formData.origin,
      destination: formData.destination,
      type: formData.type,
      mode: formData.mode,
      weight: formData.weight,
      cost: formData.cost,
      calculatedTotal: formData.calculatedTotal,
      estimatedDeliveryDate: formData.estimatedDeliveryDate,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Customer"
          options={customerOptions}
          value={formData.customerId}
          onChange={(e) => handleChange('customerId', e.target.value)}
          error={errors.customerId}
          fullWidth
          required
        />

        <Select
          label="Type"
          options={typeOptions}
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL')}
          fullWidth
          required
        />

        <Input
          label="Origin"
          type="text"
          value={formData.origin}
          onChange={(e) => handleChange('origin', e.target.value)}
          error={errors.origin}
          placeholder="Enter origin city"
          fullWidth
          required
        />

        <Input
          label="Destination"
          type="text"
          value={formData.destination}
          onChange={(e) => handleChange('destination', e.target.value)}
          error={errors.destination}
          placeholder="Enter destination city"
          fullWidth
          required
        />

        <Select
          label="Mode"
          options={modeOptions}
          value={formData.mode}
          onChange={(e) => handleChange('mode', e.target.value as 'LAND' | 'AIR' | 'WATER')}
          fullWidth
          required
        />

        <Input
          label="Weight (kg)"
          type="number"
          value={formData.weight}
          onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
          error={errors.weight}
          placeholder="Enter weight"
          min="0"
          step="0.01"
          fullWidth
          required
        />

        <Input
          label="Cost ($)"
          type="number"
          value={formData.cost}
          onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
          error={errors.cost}
          placeholder="Enter cost"
          min="0"
          step="0.01"
          fullWidth
          required
        />

        <Input
          label="Tax %"
          type="number"
          value={formData.taxPercent}
          onChange={(e) => handleChange('taxPercent', parseFloat(e.target.value) || 0)}
          error={errors.taxPercent}
          placeholder="Tax percent (e.g., 5.00)"
          min="0"
          step="0.01"
          fullWidth
          required
        />

        <Input
          label="Total after Taxes ($)"
          type="number"
          value={formData.calculatedTotal}
          onChange={() => {}}
          error={errors.calculatedTotal}
          placeholder="Calculated total"
          min="0"
          step="0.01"
          fullWidth
          required
          disabled
        />

        <Input
          label="Estimated Delivery Date"
          type="date"
          value={formData.estimatedDeliveryDate}
          onChange={(e) => handleChange('estimatedDeliveryDate', e.target.value)}
          error={errors.estimatedDeliveryDate}
          fullWidth
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {initialData ? 'Update Shipment' : 'Create Shipment'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ShipmentForm;
