import { useEffect, useMemo, useState } from 'react';
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder
} from '../services/api';

const emptyForm = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  pickupAddress: '',
  pickupLng: '-74.006',
  pickupLat: '40.7128',
  deliveryAddress: '',
  deliveryLng: '-71.0589',
  deliveryLat: '42.3601',
  totalWeight: 0,
  priority: 'medium',
  status: 'pending'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders || [];
    return (orders || []).filter((o) =>
      [o.customerName, o.customerEmail, o.orderNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [orders, query]);

  const load = async () => {
    console.log('Loading orders...');
    setLoading(true);
    setError('');
    try {
      const response = await getOrders({ limit: 100 });
      console.log('Orders response:', response);
      
      // Handle different response formats
      let ordersArray = [];
      if (response && response.data) {
        // If response has data property (axios response)
        if (response.data.orders) {
          ordersArray = response.data.orders;
        } else if (Array.isArray(response.data)) {
          ordersArray = response.data;
        }
      } else if (response && response.orders) {
        // If response directly has orders property
        ordersArray = response.orders;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        ordersArray = response;
      }
      
      console.log('Processed orders array:', ordersArray);
      setOrders(ordersArray);
    } catch (e) {
      console.error('Error loading orders:', e);
      setError(e?.response?.data?.message || e.message || 'Failed to load orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Orders component mounted');
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (order) => {
    setEditing(order);
    setForm({
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      pickupAddress: order.pickupAddress?.address || '',
      pickupLng: order.pickupAddress?.coordinates?.[0] ?? '',
      pickupLat: order.pickupAddress?.coordinates?.[1] ?? '',
      deliveryAddress: order.deliveryAddress?.address || '',
      deliveryLng: order.deliveryAddress?.coordinates?.[0] ?? '',
      deliveryLat: order.deliveryAddress?.coordinates?.[1] ?? '',
      totalWeight: order.totalWeight ?? 0,
      priority: order.priority || 'medium',
      status: order.status || 'pending'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    // Check required fields
    if (!form.customerName.trim()) return 'Customer Name is required';
    if (!form.customerEmail.trim()) return 'Customer Email is required';
    if (!form.customerPhone.trim()) return 'Customer Phone is required';
    if (!form.pickupAddress.trim()) return 'Pickup Address is required';
    if (!form.deliveryAddress.trim()) return 'Delivery Address is required';

    // Validate coordinates (make them optional with defaults)
    const lngLatPairs = [
      { key: 'pickupLng', label: 'Pickup Longitude', default: -74.006 },
      { key: 'pickupLat', label: 'Pickup Latitude', default: 40.7128 },
      { key: 'deliveryLng', label: 'Delivery Longitude', default: -71.0589 },
      { key: 'deliveryLat', label: 'Delivery Latitude', default: 42.3601 },
    ];
    
    for (const { key, label, default: defaultValue } of lngLatPairs) {
      const v = parseFloat(form[key]);
      if (form[key] && !Number.isFinite(v)) {
        return `${label} must be a valid number`;
      }
    }
    
    // Validate weight
    const w = parseFloat(String(form.totalWeight));
    if (!Number.isFinite(w) || w < 0) return 'Weight must be a non-negative number';
    
    return '';
  };

  const toPayload = () => {
    const payload = {
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      pickupAddress: { 
        address: form.pickupAddress.trim(), 
        type: 'Point', 
        coordinates: [
          parseFloat(form.pickupLng) || -74.006, 
          parseFloat(form.pickupLat) || 40.7128
        ] 
      },
      deliveryAddress: { 
        address: form.deliveryAddress.trim(), 
        type: 'Point', 
        coordinates: [
          parseFloat(form.deliveryLng) || -71.0589, 
          parseFloat(form.deliveryLat) || 42.3601
        ] 
      },
      totalWeight: parseFloat(String(form.totalWeight) || '0'),
      priority: form.priority,
      status: form.status
    };
    
    console.log('Order payload:', payload);
    return payload;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const vErr = validate();
    if (vErr) {
      setFormError(vErr);
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload();
      console.log('Submitting order:', payload);
      
      if (editing) {
        await updateOrder(editing._id, payload);
      } else {
        await createOrder(payload);
      }
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error('Create/Update order error:', e?.response?.data || e);
      
      let errorMessage = 'Failed to save order';
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
        if (e.response.data.details && Array.isArray(e.response.data.details)) {
          errorMessage += ': ' + e.response.data.details.join(', ');
        }
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setFormError(errorMessage);
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Delete failed');
    }
  };

  const populateSample = async () => {
    try {
      const samples = [
        {
          customerName: 'Acme Corp',
          customerEmail: 'ops@acme.com',
          customerPhone: '+1-555-1001',
          pickupAddress: { 
            address: 'New York, NY', 
            type: 'Point', 
            coordinates: [-74.006, 40.7128] 
          },
          deliveryAddress: { 
            address: 'Boston, MA', 
            type: 'Point', 
            coordinates: [-71.0589, 42.3601] 
          },
          totalWeight: 120,
          priority: 'high',
          status: 'pending'
        },
        {
          customerName: 'Fresh Foods',
          customerEmail: 'logistics@fresh.com',
          customerPhone: '+1-555-1002',
          pickupAddress: { 
            address: 'Chicago, IL', 
            type: 'Point', 
            coordinates: [-87.6298, 41.8781] 
          },
          deliveryAddress: { 
            address: 'Detroit, MI', 
            type: 'Point', 
            coordinates: [-83.0458, 42.3314] 
          },
          totalWeight: 80,
          priority: 'medium',
          status: 'pending'
        },
        {
          customerName: 'Tech Solutions',
          customerEmail: 'shipping@techsolutions.com',
          customerPhone: '+1-555-1003',
          pickupAddress: { 
            address: 'San Francisco, CA', 
            type: 'Point', 
            coordinates: [-122.4194, 37.7749] 
          },
          deliveryAddress: { 
            address: 'Los Angeles, CA', 
            type: 'Point', 
            coordinates: [-118.2437, 34.0522] 
          },
          totalWeight: 200,
          priority: 'urgent',
          status: 'pending'
        }
      ];
      
      console.log('Creating sample orders...');
      for (const sample of samples) {
        console.log('Creating order:', sample.customerName);
        await createOrder(sample);
      }
      
      console.log('Sample orders created successfully');
      await load();
    } catch (e) {
      console.error('Populate sample error:', e?.response?.data || e);
      const msg = e?.response?.data?.message || e.message || 'Populate failed';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-600">Create and manage orders</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Search by name/email/order no."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={populateSample} className="border px-3 py-2 rounded">Populate Sample</button>
            <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Order</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(filtered) && filtered.length > 0 ? (
                  filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{o.orderNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{o.customerName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{o.pickupAddress?.address}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{o.deliveryAddress?.address}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{o.totalWeight}</td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize">{o.priority}</td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize">{o.status}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button onClick={() => openEdit(o)} className="text-blue-600 hover:underline mr-3">Edit</button>
                        <button onClick={() => onDelete(o._id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      {loading ? 'Loading orders...' : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Order' : 'Add Order'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={onSubmit} className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Customer Name</label>
                <input name="customerName" value={form.customerName} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" name="customerEmail" value={form.customerEmail} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input name="customerPhone" value={form.customerPhone} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pickup Address</label>
                <input name="pickupAddress" value={form.pickupAddress} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pickup Lng</label>
                  <input name="pickupLng" value={form.pickupLng} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pickup Lat</label>
                  <input name="pickupLat" value={form.pickupLat} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Delivery Address</label>
                <input name="deliveryAddress" value={form.deliveryAddress} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delivery Lng</label>
                  <input name="deliveryLng" value={form.deliveryLng} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delivery Lat</label>
                  <input name="deliveryLat" value={form.deliveryLat} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
                <input name="totalWeight" type="number" value={form.totalWeight} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={onChange} className="w-full border rounded px-3 py-2">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select name="status" value={form.status} onChange={onChange} className="w-full border rounded px-3 py-2">
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="picked-up">Picked</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Canceled</option>
                </select>
              </div>

              {formError && (
                <div className="col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {formError}
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
