import { Users2 } from 'lucide-react';
import GenericCrud from '../components/GenericCrud.jsx';

export default function Suppliers() {
  return (
    <GenericCrud
      title="Supplier Management"
      endpoint="suppliers"
      icon={Users2}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'contact_person', label: 'Contact Person' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
      ]}
    />
  );
}
