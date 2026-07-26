import { BookOpen, Tag } from 'lucide-react';
import GenericCrud from '../components/GenericCrud.jsx';

export default function Menu() {
  return (
    <div className="space-y-6">
      <GenericCrud
        title="Menu Categories"
        endpoint="menu-categories"
        icon={Tag}
        fields={[{ key: 'name', label: 'Name' }, { key: 'display_order', label: 'Order', type: 'number' }]}
      />
      <GenericCrud
        title="Menu Items"
        endpoint="menu-items"
        icon={BookOpen}
        fields={[
          { key: 'name', label: 'Name' },
          {
            key: 'category_id',
            label: 'Category',
            type: 'select',
            optionsEndpoint: 'menu-categories',
            displayKey: 'cat_name',
          },
          { key: 'price', label: 'Price', type: 'number' },
          { key: 'cost_price', label: 'Cost Price', type: 'number' },
          { key: 'avg_prep_time_minutes', label: 'Prep Time (min)', type: 'number' },
        ]}
      />
    </div>
  );
}
