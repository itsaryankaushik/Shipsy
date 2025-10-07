'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, SelectOption } from '../ui';

interface ShipmentFormData {
  customerId: string;
  startLocation: string;
  endLocation: string;
  // Use server enum labels directly in the form values
  type: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL';
  mode: 'LAND' | 'AIR' | 'WATER';
  cost: number;
  taxPercent: number;
  calculatedTotal: number; // total after taxes
  estimatedDeliveryDate: string; // YYYY-MM-DD format for date input
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
  // Helper to format date for input (convert ISO to YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper to calculate tax percent from cost and total
  const calculateTaxPercent = (cost: number, total: number): number => {
    if (cost <= 0) return 0;
    return parseFloat((((total - cost) / cost) * 100).toFixed(2));
  };

  const getInitialFormData = (): ShipmentFormData => {
    // Default to 7 days from now for new shipments
    const getDefaultDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    };

    // For edit mode, use existing estimatedDeliveryDate, otherwise use default
    const estimatedDate = (initialData as any)?.estimatedDeliveryDate 
      ? formatDateForInput((initialData as any).estimatedDeliveryDate)
      : getDefaultDate();

    return {
      customerId: initialData?.customerId || '',
      startLocation: (initialData as any)?.startLocation || '',
      endLocation: (initialData as any)?.endLocation || '',
      // normalize any incoming initialData values to server enum labels (UPPERCASE)
      type: (initialData?.type ? (initialData.type as any).toString().toUpperCase() : 'LOCAL') as 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL',
      mode: (initialData?.mode ? (initialData.mode as any).toString().toUpperCase() : 'LAND') as 'LAND' | 'AIR' | 'WATER',
      cost: initialData?.cost ? parseFloat(initialData.cost.toString()) : 0,
      taxPercent: initialData?.cost && initialData?.calculatedTotal 
        ? calculateTaxPercent(parseFloat(initialData.cost.toString()), parseFloat(initialData.calculatedTotal.toString()))
        : 0,
      calculatedTotal: initialData?.calculatedTotal ? parseFloat(initialData.calculatedTotal.toString()) : 0,
      estimatedDeliveryDate: estimatedDate,
    };
  };

  const [formData, setFormData] = useState<ShipmentFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof ShipmentFormData, string>>>({});

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
  }, [initialData]);

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
    if (!formData.startLocation.trim()) newErrors.startLocation = 'Start location is required';
    if (!formData.endLocation.trim()) newErrors.endLocation = 'End location is required';
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

    // Build payload: use correct field names for API
    const payload: any = {
      customerId: formData.customerId,
      startLocation: formData.startLocation,
      endLocation: formData.endLocation,
      type: formData.type,
      mode: formData.mode,
      cost: formData.cost.toString(),
      calculatedTotal: formData.calculatedTotal.toString(),
      estimatedDeliveryDate: formData.estimatedDeliveryDate, // Send as YYYY-MM-DD, API will handle conversion
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
          label="Start Location"
          type="text"
          value={formData.startLocation}
          onChange={(e) => handleChange('startLocation', e.target.value)}
          error={errors.startLocation}
          placeholder="Enter start location"
          fullWidth
          required
        />

        <Input
          label="End Location"
          type="text"
          value={formData.endLocation}
          onChange={(e) => handleChange('endLocation', e.target.value)}
          error={errors.endLocation}
          placeholder="Enter end location"
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
          label="Estimated Delivery Date"
          type="date"
          value={formData.estimatedDeliveryDate}
          onChange={(e) => handleChange('estimatedDeliveryDate', e.target.value)}
          error={errors.estimatedDeliveryDate}
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
