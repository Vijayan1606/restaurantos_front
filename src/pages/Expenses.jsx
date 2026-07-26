import { Tags, Receipt } from 'lucide-react';
import GenericCrud from '../components/GenericCrud.jsx';

export default function Expenses() {
  return (
    <div className="space-y-6">
      <GenericCrud title="Expense Categories" endpoint="expense-categories" icon={Tags} fields={[{ key: 'name', label: 'Name' }]} />
      <GenericCrud
        title="Expense Records"
        endpoint="expenses"
        icon={Receipt}
        fields={[
          {
            key: 'category_id',
            label: 'Category',
            type: 'select',
            optionsEndpoint: 'expense-categories',
            displayKey: 'cat_name',
          },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', type: 'number' },
          { key: 'expense_date', label: 'Date', type: 'date' },
          {
            key: 'supplier_id',
            label: 'Supplier',
            type: 'select',
            optionsEndpoint: 'suppliers',
            displayKey: 'sup_name',
          },
          {
            key: 'payment_method',
            label: 'Payment Method',
            type: 'select',
            options: ['cash', 'card', 'bank_transfer', 'upi', 'cheque'],
          },
        ]}
      />
    </div>
  );
}
