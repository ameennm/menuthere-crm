// MenuThere CRM - Cloudflare Worker API
// Connects to D1 database for all CRUD operations

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // ==================== CUSTOMERS ====================

            // GET /api/customers — list all (with optional filters)
            if (method === 'GET' && path === '/api/customers') {
                const status = url.searchParams.get('status');
                const paymentStatus = url.searchParams.get('paymentStatus');
                const restaurantType = url.searchParams.get('restaurantType');
                const search = url.searchParams.get('search');

                let query = 'SELECT * FROM customers WHERE 1=1';
                const params = [];

                if (status && status !== 'all') {
                    query += ' AND status = ?';
                    params.push(status);
                }
                if (paymentStatus && paymentStatus !== 'all') {
                    query += ' AND payment_status = ?';
                    params.push(paymentStatus);
                }
                if (restaurantType && restaurantType !== 'all') {
                    query += ' AND restaurant_type = ?';
                    params.push(restaurantType);
                }
                if (search) {
                    query += ' AND (name LIKE ? OR whatsapp LIKE ? OR location LIKE ?)';
                    const s = `%${search}%`;
                    params.push(s, s, s);
                }

                query += ' ORDER BY created_at DESC';

                const result = await env.DB.prepare(query).bind(...params).all();
                return json({ customers: result.results.map(toFrontend) });
            }

            // GET /api/customers/:id
            if (method === 'GET' && path.match(/^\/api\/customers\/[^/]+$/)) {
                const id = path.split('/').pop();
                const result = await env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
                if (!result) return json({ error: 'Customer not found' }, 404);
                return json({ customer: toFrontend(result) });
            }

            // POST /api/customers — create
            if (method === 'POST' && path === '/api/customers') {
                const body = await request.json();
                const id = generateId();
                const now = new Date().toISOString();

                await env.DB.prepare(
                    `INSERT INTO customers (id, name, whatsapp, status, payment_status, amount, location, restaurant_type, product_type, next_call_date, call_notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.name || '',
                    body.whatsapp || '',
                    body.status || 'warm',
                    body.paymentStatus || 'pending',
                    parseFloat(body.amount) || 0,
                    body.location || '',
                    body.restaurantType || 'cafe',
                    body.productType || 'petpooja',
                    body.nextCallDate || '',
                    body.callNotes || '',
                    now,
                    now
                ).run();

                const created = await env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
                return json({ customer: toFrontend(created) }, 201);
            }

            // PUT /api/customers/:id — update
            if (method === 'PUT' && path.match(/^\/api\/customers\/[^/]+$/)) {
                const id = path.split('/').pop();
                const body = await request.json();
                const now = new Date().toISOString();

                const existing = await env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
                if (!existing) return json({ error: 'Customer not found' }, 404);

                await env.DB.prepare(
                    `UPDATE customers SET
            name = ?, whatsapp = ?, status = ?, payment_status = ?,
            amount = ?, location = ?, restaurant_type = ?, product_type = ?,
            next_call_date = ?, call_notes = ?, updated_at = ?
           WHERE id = ?`
                ).bind(
                    body.name ?? existing.name,
                    body.whatsapp ?? existing.whatsapp,
                    body.status ?? existing.status,
                    body.paymentStatus ?? existing.payment_status,
                    parseFloat(body.amount ?? existing.amount) || 0,
                    body.location ?? existing.location,
                    body.restaurantType ?? existing.restaurant_type,
                    body.productType ?? existing.product_type,
                    body.nextCallDate ?? existing.next_call_date ?? '',
                    body.callNotes ?? existing.call_notes ?? '',
                    now,
                    id
                ).run();

                const updated = await env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
                return json({ customer: toFrontend(updated) });
            }

            // DELETE /api/customers/:id
            if (method === 'DELETE' && path.match(/^\/api\/customers\/[^/]+$/)) {
                const id = path.split('/').pop();
                const existing = await env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
                if (!existing) return json({ error: 'Customer not found' }, 404);

                await env.DB.prepare('DELETE FROM customers WHERE id = ?').bind(id).run();
                return json({ success: true });
            }

            // ==================== DASHBOARD ====================

            // GET /api/dashboard?range=all|today|week|month|custom&from=&to=
            if (method === 'GET' && path === '/api/dashboard') {
                const range = url.searchParams.get('range') || 'all';
                const customFrom = url.searchParams.get('from');
                const customTo = url.searchParams.get('to');

                let dateFilter = '';
                const dateParams = [];

                if (range === 'today') {
                    dateFilter = " AND date(created_at) = date('now')";
                } else if (range === 'week') {
                    dateFilter = " AND created_at >= datetime('now', '-7 days')";
                } else if (range === 'month') {
                    dateFilter = " AND created_at >= datetime('now', '-1 month')";
                } else if (range === 'custom' && customFrom && customTo) {
                    dateFilter = ' AND date(created_at) >= ? AND date(created_at) <= ?';
                    dateParams.push(customFrom, customTo);
                }

                // Total sales (paid, filtered by date)
                const salesResult = await env.DB.prepare(
                    `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
           FROM customers WHERE payment_status = 'paid' ${dateFilter}`
                ).bind(...dateParams).first();

                // Total pending (always all-time)
                const pendingResult = await env.DB.prepare(
                    `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
           FROM customers WHERE payment_status = 'pending'`
                ).first();

                // Total customers in period
                const totalResult = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE 1=1 ${dateFilter}`
                ).bind(...dateParams).first();

                // Hot / Warm leads in period
                const hotResult = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE status = 'hot' ${dateFilter}`
                ).bind(...dateParams).first();

                const warmResult = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE status = 'warm' ${dateFilter}`
                ).bind(...dateParams).first();

                // By restaurant type in period
                const restaurantCount = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE restaurant_type = 'restaurant' ${dateFilter}`
                ).bind(...dateParams).first();

                const cafeCount = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE restaurant_type = 'cafe' ${dateFilter}`
                ).bind(...dateParams).first();

                const juiceCount = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE restaurant_type = 'juice-shop' ${dateFilter}`
                ).bind(...dateParams).first();

                const hotelCount = await env.DB.prepare(
                    `SELECT COUNT(*) as count FROM customers WHERE restaurant_type = 'hotel' ${dateFilter}`
                ).bind(...dateParams).first();

                // Daily sales (last 7 days — always)
                const dailySales = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayStr = d.toISOString().split('T')[0];
                    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                    const dayResult = await env.DB.prepare(
                        `SELECT COALESCE(SUM(amount), 0) as total
             FROM customers WHERE payment_status = 'paid' AND date(created_at) = ?`
                    ).bind(dayStr).first();

                    dailySales.push({ date: dayLabel, sales: dayResult.total });
                }

                // Pending payments list
                const pendingList = await env.DB.prepare(
                    `SELECT * FROM customers WHERE payment_status = 'pending' ORDER BY created_at DESC`
                ).all();

                return json({
                    totalSales: salesResult.total,
                    paidCount: salesResult.count,
                    totalPending: pendingResult.total,
                    pendingCount: pendingResult.count,
                    totalCustomers: totalResult.count,
                    hotLeads: hotResult.count,
                    warmLeads: warmResult.count,
                    byRestaurant: {
                        restaurant: restaurantCount.count,
                        cafe: cafeCount.count,
                        'juice-shop': juiceCount.count,
                        hotel: hotelCount.count,
                    },
                    dailySales,
                    pendingPayments: pendingList.results.map(toFrontend),
                });
            }

            // ==================== HEALTH ====================
            if (method === 'GET' && (path === '/' || path === '/api/health')) {
                return json({ status: 'ok', service: 'menuthere-crm-api' });
            }

            return json({ error: 'Not found' }, 404);

        } catch (err) {
            console.error(err);
            return json({ error: err.message || 'Internal server error' }, 500);
        }
    },
};

// Convert DB row (snake_case) to frontend format (camelCase)
function toFrontend(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        whatsapp: row.whatsapp,
        status: row.status,
        paymentStatus: row.payment_status,
        amount: row.amount,
        location: row.location,
        restaurantType: row.restaurant_type,
        productType: row.product_type,
        nextCallDate: row.next_call_date || '',
        callNotes: row.call_notes || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
