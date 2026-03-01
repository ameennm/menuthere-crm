// LocalStorage-based store — easy to swap with backend API later
const STORAGE_KEY = 'menuthere_customers';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getCustomers() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveCustomers(customers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function addCustomer(customer) {
    const customers = getCustomers();
    const newCustomer = {
        ...customer,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    saveCustomers(customers);
    return newCustomer;
}

export function updateCustomer(id, updates) {
    const customers = getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    customers[index] = {
        ...customers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    saveCustomers(customers);
    return customers[index];
}

export function deleteCustomer(id) {
    const customers = getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    saveCustomers(filtered);
    return filtered;
}

export function getCustomerById(id) {
    const customers = getCustomers();
    return customers.find(c => c.id === id) || null;
}

// ========== Dashboard helpers ==========

export function getFilteredCustomers(dateRange, customFrom, customTo) {
    const customers = getCustomers();
    const now = new Date();

    if (dateRange === 'all') return customers;

    let startDate;
    if (dateRange === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === 'week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === 'month') {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    } else if (dateRange === 'custom' && customFrom && customTo) {
        startDate = new Date(customFrom);
        const endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
        return customers.filter(c => {
            const d = new Date(c.createdAt);
            return d >= startDate && d <= endDate;
        });
    }

    if (!startDate) return customers;
    return customers.filter(c => new Date(c.createdAt) >= startDate);
}

export function getDashboardStats(dateRange, customFrom, customTo) {
    const filtered = getFilteredCustomers(dateRange, customFrom, customTo);
    const all = getCustomers();

    const totalSales = filtered
        .filter(c => c.paymentStatus === 'paid')
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const totalPending = all
        .filter(c => c.paymentStatus === 'pending')
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const pendingCount = all.filter(c => c.paymentStatus === 'pending').length;
    const paidCount = filtered.filter(c => c.paymentStatus === 'paid').length;
    const hotLeads = filtered.filter(c => c.status === 'hot').length;
    const warmLeads = filtered.filter(c => c.status === 'warm').length;
    const totalCustomers = filtered.length;

    // Restaurant type breakdown
    const byRestaurant = {
        cafe: filtered.filter(c => c.restaurantType === 'cafe').length,
        'juice-shop': filtered.filter(c => c.restaurantType === 'juice-shop').length,
        hotel: filtered.filter(c => c.restaurantType === 'hotel').length,
    };

    // Daily sales for chart (last 7 days)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStr = date.toISOString().split('T')[0];
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const daySales = all
            .filter(c => c.paymentStatus === 'paid' && c.createdAt.startsWith(dayStr))
            .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        dailySales.push({ date: dayLabel, sales: daySales });
    }

    // Pending payments list
    const pendingPayments = all
        .filter(c => c.paymentStatus === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
        totalSales,
        totalPending,
        pendingCount,
        paidCount,
        hotLeads,
        warmLeads,
        totalCustomers,
        byRestaurant,
        dailySales,
        pendingPayments,
    };
}

// Seed demo data if empty
export function seedDemoData() {
    if (getCustomers().length > 0) return;

    const names = [
        'Rahul Sharma', 'Priya Patel', 'Arjun Nair', 'Meera Reddy', 'Vikram Singh',
        'Anita Desai', 'Kiran Kumar', 'Sneha Gupta', 'Raj Malhotra', 'Deepa Iyer',
        'Anil Kapoor', 'Fatima Khan', 'Suresh Menon', 'Lakshmi Rao', 'Omar Sheikh',
    ];
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kochi', 'Jaipur'];
    const types = ['cafe', 'juice-shop', 'hotel'];
    const statuses = ['hot', 'warm'];
    const payments = ['paid', 'pending'];

    const demoCustomers = names.map((name, i) => {
        const daysAgo = Math.floor(Math.random() * 14);
        const created = new Date();
        created.setDate(created.getDate() - daysAgo);
        return {
            id: generateId() + i,
            name,
            whatsapp: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            paymentStatus: payments[Math.floor(Math.random() * payments.length)],
            amount: (Math.floor(Math.random() * 50) + 5) * 100,
            location: locations[Math.floor(Math.random() * locations.length)],
            restaurantType: types[Math.floor(Math.random() * types.length)],
            createdAt: created.toISOString(),
            updatedAt: created.toISOString(),
        };
    });

    saveCustomers(demoCustomers);
}
