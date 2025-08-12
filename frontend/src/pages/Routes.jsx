import { useEffect, useMemo, useState } from 'react';
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../services/api';

const emptyForm = {
  name: '',
  description: '',
  startAddress: '',
  startLng: '',
  startLat: '',
  endAddress: '',
  endLng: '',
  endLat: '',
  estimatedDistance: '',
  estimatedDuration: '',
  status: 'planned',
  priority: 'medium'
};

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) =>
      [r.name, r.description, r?.assignedDriver?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [routes, query]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRoutes({ limit: 100 });
      setRoutes(data.routes || data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (route) => {
    setEditing(route);
    setForm({
      name: route.name || '',
      description: route.description || '',
      startAddress: route.startLocation?.address || '',
      startLng: route.startLocation?.coordinates?.[0] ?? '',
      startLat: route.startLocation?.coordinates?.[1] ?? '',
      endAddress: route.endLocation?.address || '',
      endLng: route.endLocation?.coordinates?.[0] ?? '',
      endLat: route.endLocation?.coordinates?.[1] ?? '',
      estimatedDistance: route.estimatedDistance ?? '',
      estimatedDuration: route.estimatedDuration ?? '',
      status: route.status || 'planned',
      priority: route.priority || 'medium'
    });
    setIsModalOpen(true);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toPayload = () => ({
    name: form.name,
    description: form.description,
    startLocation: {
      address: form.startAddress,
      type: 'Point',
      coordinates: [parseFloat(form.startLng), parseFloat(form.startLat)]
    },
    endLocation: {
      address: form.endAddress,
      type: 'Point',
      coordinates: [parseFloat(form.endLng), parseFloat(form.endLat)]
    },
    estimatedDistance: parseInt(form.estimatedDistance || '0', 10),
    estimatedDuration: parseInt(form.estimatedDuration || '0', 10),
    status: form.status,
    priority: form.priority
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload();
      if (editing) {
        await updateRoute(editing._id, payload);
      } else {
        await createRoute(payload);
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
    if (!confirm('Delete this route?')) return;
    try {
      await deleteRoute(id);
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
            <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
            <p className="text-sm text-gray-600">Create and maintain delivery routes</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Route</button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{r.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.startLocation?.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.endLocation?.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.estimatedDistance} km</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.estimatedDuration} min</td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">{r.status}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => onDelete(r._id)} className="text-red-600 hover:underline">Delete</button>
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
          <div className="bg-white rounded shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Route' : 'Add Route'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={onSubmit} className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <input name="description" value={form.description} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Address</label>
                <input name="startAddress" value={form.startAddress} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Lng</label>
                  <input name="startLng" value={form.startLng} onChange={onChange} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Lat</label>
                  <input name="startLat" value={form.startLat} onChange={onChange} className="w-full border rounded px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Address</label>
                <input name="endAddress" value={form.endAddress} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Lng</label>
                  <input name="endLng" value={form.endLng} onChange={onChange} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Lat</label>
                  <input name="endLat" value={form.endLat} onChange={onChange} className="w-full border rounded px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Distance (km)</label>
                <input name="estimatedDistance" type="number" value={form.estimatedDistance} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Duration (min)</label>
                <input name="estimatedDuration" type="number" value={form.estimatedDuration} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select name="status" value={form.status} onChange={onChange} className="w-full border rounded px-3 py-2">
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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

export default RoutesPage;
