import { Layers, Package, Warehouse, Wheat, ArrowLeftRight } from 'lucide-react';
import GenericCrud from '../components/GenericCrud.jsx';

export default function Inventory() {
  return (
    <div className="space-y-6">
      <GenericCrud title="Product Categories" endpoint="product-categories" icon={Layers} fields={[{ key: 'name', label: 'Name' }]} />

      <GenericCrud
        title="Products"
        endpoint="products"
        icon={Package}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'sku', label: 'SKU' },
          {
            key: 'category_id',
            label: 'Category',
            type: 'select',
            optionsEndpoint: 'product-categories',
            displayKey: 'cat_name',
          },
          { key: 'unit', label: 'Unit' },
          { key: 'unit_cost', label: 'Unit Cost', type: 'number' },
        ]}
      />

      <GenericCrud
        title="Warehouses / Stores"
        endpoint="warehouses"
        icon={Warehouse}
        fields={[{ key: 'name', label: 'Name' }, { key: 'location', label: 'Location' }]}
      />

      <GenericCrud
        title="Ingredients"
        endpoint="ingredients"
        icon={Wheat}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'unit', label: 'Unit' },
          { key: 'current_stock', label: 'Current Stock', type: 'number' },
          { key: 'reorder_level', label: 'Reorder Level', type: 'number' },
          { key: 'unit_cost', label: 'Unit Cost', type: 'number' },
          {
            key: 'supplier_id',
            label: 'Supplier',
            type: 'select',
            optionsEndpoint: 'suppliers',
            displayKey: 'sup_name',
          },
        ]}
      />

      <GenericCrud
        title="Stock Movements (In/Out)"
        endpoint="stock-movements"
        icon={ArrowLeftRight}
        fields={[
          {
            key: 'product_id',
            label: 'Product',
            type: 'select',
            optionsEndpoint: 'products',
            displayKey: 'prod_name',
          },
          {
            key: 'warehouse_id',
            label: 'Warehouse',
            type: 'select',
            optionsEndpoint: 'warehouses',
            displayKey: 'wh_name',
          },
          { key: 'movement_type', label: 'Direction', type: 'select', options: ['IN', 'OUT'] },
          { key: 'quantity', label: 'Quantity', type: 'number' },
          { key: 'reference', label: 'Reference' },
        ]}
      />
    </div>
  );
}
