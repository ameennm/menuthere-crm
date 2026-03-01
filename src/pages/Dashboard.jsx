import { useState, useMemo } from 'react';
import {
    DollarSign,
    Users,
    Clock,
    TrendingUp,
    Flame,
    Thermometer,
    Coffee,
    GlassWater,
    Hotel,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import TopBar from '../components/TopBar';
import { getDashboardStats } from '../store/customerStore';

const PIE_COLORS = ['#22d3ee', '#34d399', '#7c5cfc'];

function formatCurrency(val) {
    return '₹' + val.toLocaleString('en-IN');
}

export default function Dashboard({ onMenuClick }) {
    const [dateRange, setDateRange] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const stats = useMemo(
        () => getDashboardStats(dateRange, customFrom, customTo),
        [dateRange, customFrom, customTo]
    );

    const pieData = [
        { name: 'Cafe', value: stats.byRestaurant.cafe },
        { name: 'Juice Shop', value: stats.byRestaurant['juice-shop'] },
        { name: 'Hotel', value: stats.byRestaurant.hotel },
    ].filter(d => d.value > 0);

    return (
        <>
            <TopBar
                title="Dashboard"
                subtitle="Sales overview & analytics"
                onMenuClick={onMenuClick}
            >
                <div className="date-tabs">
                    {['all', 'today', 'week', 'month', 'custom'].map(tab => (
                        <button
                            key={tab}
                            className={`date-tab ${dateRange === tab ? 'active' : ''}`}
                            onClick={() => setDateRange(tab)}
                        >
                            {tab === 'all' ? 'All Time' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </TopBar>

            <div className="page-content">
                {dateRange === 'custom' && (
                    <div className="custom-date-range" style={{ marginBottom: 20 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12.5, fontWeight: 600 }}>From:</span>
                        <input
                            type="date"
                            className="form-input"
                            value={customFrom}
                            onChange={e => setCustomFrom(e.target.value)}
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: 12.5, fontWeight: 600 }}>To:</span>
                        <input
                            type="date"
                            className="form-input"
                            value={customTo}
                            onChange={e => setCustomTo(e.target.value)}
                        />
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card green">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Total Sales</span>
                            <div className="stat-card-icon green">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>
                            {formatCurrency(stats.totalSales)}
                        </div>
                        <div className="stat-card-sub">{stats.paidCount} paid customers</div>
                    </div>

                    <div className="stat-card orange">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Pending Amount</span>
                            <div className="stat-card-icon orange">
                                <Clock size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value" style={{ color: 'var(--accent-orange)' }}>
                            {formatCurrency(stats.totalPending)}
                        </div>
                        <div className="stat-card-sub">{stats.pendingCount} pending payments</div>
                    </div>

                    <div className="stat-card purple">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Total Customers</span>
                            <div className="stat-card-icon purple">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value">{stats.totalCustomers}</div>
                        <div className="stat-card-sub">In selected period</div>
                    </div>

                    <div className="stat-card red">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Hot Leads</span>
                            <div className="stat-card-icon red">
                                <Flame size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value" style={{ color: 'var(--accent-red)' }}>
                            {stats.hotLeads}
                        </div>
                        <div className="stat-card-sub">{stats.warmLeads} warm leads</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="dashboard-grid">
                    {/* Sales Bar Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3>Sales (Last 7 Days)</h3>
                            <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={stats.dailySales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#5a5a6e', fontSize: 11 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#5a5a6e', fontSize: 11 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                    tickFormatter={v => `₹${v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1c1c27',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 10,
                                        fontSize: 12,
                                        color: '#f0f0f5',
                                    }}
                                    formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Sales']}
                                />
                                <Bar
                                    dataKey="sales"
                                    fill="url(#barGradient)"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={40}
                                />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Restaurant Type Pie Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3>By Restaurant Type</h3>
                        </div>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((_, idx) => (
                                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: 12, color: '#8e8ea0' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1c1c27',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 10,
                                            fontSize: 12,
                                            color: '#f0f0f5',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <p>No data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Restaurant Type Quick Stats */}
                <div className="stats-grid" style={{ marginBottom: 28 }}>
                    <div className="stat-card cyan">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Cafes</span>
                            <div className="stat-card-icon cyan">
                                <Coffee size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value">{stats.byRestaurant.cafe}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Juice Shops</span>
                            <div className="stat-card-icon green">
                                <GlassWater size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value">{stats.byRestaurant['juice-shop']}</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Hotels</span>
                            <div className="stat-card-icon blue">
                                <Hotel size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value">{stats.byRestaurant.hotel}</div>
                    </div>
                </div>

                {/* Pending Payments */}
                <div className="card">
                    <div className="card-header">
                        <h3>⏳ Pending Payments ({stats.pendingCount})</h3>
                        <span style={{ color: 'var(--accent-yellow)', fontSize: 14, fontWeight: 700 }}>
                            {formatCurrency(stats.totalPending)}
                        </span>
                    </div>
                    <div className="card-body">
                        {stats.pendingPayments.length > 0 ? (
                            <div className="pending-list">
                                {stats.pendingPayments.map(c => (
                                    <div key={c.id} className="pending-item">
                                        <div className="pending-item-info">
                                            <div className="pending-avatar">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="pending-item-name">{c.name}</div>
                                                <div className="pending-item-details">
                                                    {c.location} · {c.restaurantType === 'juice-shop' ? 'Juice Shop' : c.restaurantType.charAt(0).toUpperCase() + c.restaurantType.slice(1)} · {c.whatsapp}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pending-item-amount">{formatCurrency(c.amount)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h4>All caught up! 🎉</h4>
                                <p>No pending payments</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
