// API layer with optimistic updates
// UI updates instantly, DB sync happens in the background

const API_URL = import.meta.env.VITE_API_URL || '';

// ============ Low-level fetch helper ============
async function apiFetch(path, options = {}) {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API error ${res.status}`);
    }
    return res.json();
}

// ============ Customer API ============
export const customerAPI = {
    async getAll() {
        const { customers } = await apiFetch('/api/customers');
        return customers;
    },

    async create(data) {
        const { customer } = await apiFetch('/api/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return customer;
    },

    async update(id, data) {
        const { customer } = await apiFetch(`/api/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return customer;
    },

    async delete(id) {
        await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
    },
};

// ============ Dashboard API ============
export const dashboardAPI = {
    async getStats(range = 'all', from = '', to = '') {
        const params = new URLSearchParams({ range });
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        return apiFetch(`/api/dashboard?${params}`);
    },
};
