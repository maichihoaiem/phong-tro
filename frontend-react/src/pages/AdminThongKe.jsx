import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
	LineChart, Line, Cell
} from 'recharts';

function AdminThongKe() {
	const [stats, setStats] = useState([]);
	const [totalRevenue, setTotalRevenue] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const res = await axios.get('/api/admin/stats/revenue', { withCredentials: true });
			if (res.data.success) {
				setStats(res.data.data);
				setTotalRevenue(res.data.totalRevenue);
			}
		} catch (err) {
			console.error("Error fetching stats:", err);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (value) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	// Tính toán tăng trưởng tháng gần nhất
	const latestMonth = stats.length > 0 ? stats[stats.length - 1] : null;
	const previousMonth = stats.length > 1 ? stats[stats.length - 2] : null;
	let growth = 0;
	if (latestMonth && previousMonth && previousMonth.revenue > 0) {
		growth = ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-2">
				<i className="fas fa-chart-bar" style={{ color: '#2563EB' }}></i> Quản lý <span style={{ color: '#2563EB' }}>Thống Kê Hệ Thống</span>
			</h1>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">
							<i className="fas fa-hand-holding-usd"></i>
						</div>
						<div>
							<p className="text-gray-400 text-sm font-medium">Tổng doanh thu phí sàn</p>
							<h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</h3>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-xl">
							<i className="fas fa-calendar-check"></i>
						</div>
						<div>
							<p className="text-gray-400 text-sm font-medium">Doanh thu tháng này</p>
							<h3 className="text-2xl font-bold text-gray-800">
								{latestMonth ? formatCurrency(latestMonth.revenue) : '0 đ'}
							</h3>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">
							<i className="fas fa-chart-pie"></i>
						</div>
						<div>
							<p className="text-gray-400 text-sm font-medium">Tăng trưởng tháng</p>
							<h3 className={`text-2xl font-bold ${growth >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
								{growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
							</h3>
						</div>
					</div>
				</div>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
					<h3 className="font-bold text-gray-700 mb-6">Biểu đồ Doanh thu Phí sàn (6 tháng gần nhất)</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
								<XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
								<YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
								<Tooltip 
									contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
									formatter={(value) => [formatCurrency(value), 'Doanh thu']}
								/>
								<Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
									{stats.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={index === stats.length - 1 ? '#2563eb' : '#93c5fd'} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
					<h3 className="font-bold text-gray-700 mb-6">Số lượng đặt phòng thành công</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={stats}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
								<XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
								<YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
								<Tooltip 
									contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
									formatter={(value) => [value, 'Đơn thành công']}
								/>
								<Line type="monotone" dataKey="totalBookings" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
            
			<div className="mt-8 bg-blue-50 p-4 rounded-xl text-blue-600 text-sm flex items-start gap-3">
				<i className="fas fa-info-circle mt-0.5"></i>
				<p>Số liệu được cập nhật từ phí sàn 5% trên mỗi giao dịch đặt cọc hoặc thanh toán thành công được chủ trọ duyệt. Hệ thống tự động ghi nhận doanh thu vào thời điểm chủ trọ chuyển trạng thái sang "Đã duyệt".</p>
			</div>
		</div>
	);
}

export default AdminThongKe;
// ...existing code from AdminDashboard.jsx will be inserted here
