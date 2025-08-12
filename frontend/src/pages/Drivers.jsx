import { useEffect, useMemo, useState } from 'react';
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver
} from '../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  licenseNumber: '',
  vehicleType: 'van',
  vehicleCapacity: 1000,
  isAvailable: true
};

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) =>
      [d.name, d.email, d.phone, d.licenseNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [drivers, query]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await getDrivers({ limit: 100 });
      const data = resp?.data || {};
      setDrivers(data.drivers || data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (driver) => {
    setEditing(driver);
    setForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      vehicleType: driver.vehicleType || 'van',
      vehicleCapacity: driver.vehicleCapacity || 1000,
      isAvailable: !!driver.isAvailable
    });
    setIsModalOpen(true);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDriver(editing._id, form);
      } else {
        await createDriver(form);
      }
      setIsModalOpen(false);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this driver?')) return;
    try {
      await deleteDriver(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
            <p className="text-sm text-gray-600">Manage your delivery workforce</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={openCreate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Driver
            </button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{d.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{d.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{d.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">{d.vehicleType}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{d.vehicleCapacity}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${d.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {d.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => openEdit(d)}
                        className="text-blue-600 hover:underline mr-3"
                      >Edit</button>
                      <button
                        onClick={() => onDelete(d._id)}
                        className="text-red-600 hover:underline"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={onSubmit} className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">License Number</label>
                <input name="licenseNumber" value={form.licenseNumber} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={onChange} className="w-full border rounded px-3 py-2">
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                <input type="number" name="vehicleCapacity" value={form.vehicleCapacity} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input id="isAvailable" type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={onChange} />
                <label htmlFor="isAvailable" className="text-sm text-gray-700">Available</label>
              </div>

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

export default Drivers;
