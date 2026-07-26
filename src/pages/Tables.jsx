import { UtensilsCrossed } from 'lucide-react';
import GenericCrud from '../components/GenericCrud.jsx';

export default function Tables() {
  return (
    <GenericCrud
      title="Table Management"
      endpoint="tables"
      icon={UtensilsCrossed}
      fields={[
        { key: 'table_number', label: 'Table No.' },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        { key: 'location', label: 'Location' },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['available', 'occupied', 'reserved', 'cleaning'],
        },
      ]}
    />
  );
}
