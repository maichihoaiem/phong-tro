import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminQuanLyBaiDang() {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [processingId, setProcessingId] = useState(null);
	const [filter, setFilter] = useState('all');
	const [previewPost, setPreviewPost] = useState(null);
	const [showAllPosts, setShowAllPosts] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		loadPosts();
	}, []);

	useEffect(() => {
		setShowAllPosts(false);
	}, [filter]);

	const loadPosts = async () => {
		try {
			setLoading(true);
			const res = await axios.get('/api/admin/room-posts', { withCredentials: true });
			if (res.data.success) {
				setPosts(res.data.data || []);
			}
		} catch (err) {
			if (err.response?.status === 401 || err.response?.status === 403) {
				navigate('/');
				return;
			}
			setError('Không thể tải danh sách bài đăng.');
		} finally {
			setLoading(false);
		}
	};

	const updateStatus = async (post, action, customLabel) => {
		const actionLabelMap = {
			duyet: 'Duyệt',
			'tu-choi': 'Từ chối / Gỡ',
			an: 'Ẩn',
			'bo-an': 'Bỏ ẩn'
		};
		const actionLabel = customLabel || actionLabelMap[action] || 'Cập nhật';
		if (!window.confirm(`Bạn chắc chắn muốn ${actionLabel.toLowerCase()} bài #${post.ID_Phong}?`)) return;

		setProcessingId(post.ID_Phong);
		try {
			const res = await axios.put(
				`/api/admin/room-posts/${post.ID_Phong}/moderate`,
				{ action },
				{ withCredentials: true }
			);
			if (res.data.success) {
				await loadPosts();
				window.dispatchEvent(new Event('ozic:notifications-refresh'));
			}
		} catch (err) {
			alert(err.response?.data?.message || `Không thể ${actionLabel.toLowerCase()} bài đăng.`);
		} finally {
			setProcessingId(null);
		}
	};

	const getImageUrl = (path) => {
		if (!path) return '';
		if (path.startsWith('http://') || path.startsWith('https://')) return path;
		if (path.startsWith('/uploads/')) return `${path}`;
		if (path.startsWith('uploads/')) return `/${path}`;
		return path;
	};

	const filteredPosts = useMemo(() => {
		if (filter === 'all') return posts;
		if (filter === 'pending') return posts.filter((p) => p.TrangThai === 'Chờ duyệt');
		if (filter === 'approved') return posts.filter((p) => !p.TrangThai || p.TrangThai === 'Còn trống' || p.TrangThai === 'Đang trống');
		if (filter === 'hidden') return posts.filter((p) => p.TrangThai === 'Đã ẩn');
		if (filter === 'removed') return posts.filter((p) => p.TrangThai === 'Đã gỡ');
		return posts;
	}, [posts, filter]);

	const pendingCount = useMemo(() => posts.filter((p) => p.TrangThai === 'Chờ duyệt').length, [posts]);
	const visiblePosts = useMemo(() => (showAllPosts ? filteredPosts : filteredPosts.slice(0, 10)), [filteredPosts, showAllPosts]);
	const hasMoreThanTen = filteredPosts.length > 10;

	if (loading) {
		return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>;
	}

	if (error) {
		return <div className="text-center py-20 text-red-500">{error}</div>;
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<h1 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center gap-2">
				<i className="fas fa-list-check" style={{ color: '#D97706' }}></i>
				Quản lý <span style={{ color: '#D97706' }}>Bài Đăng Phòng</span>
			</h1>
			<p className="text-gray-500 mb-6">Admin duyệt bài đăng trước khi hiển thị công khai trên web</p>

			{pendingCount > 0 && (
				<div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 animate-pulse">
					<p className="text-red-700 font-extrabold text-sm md:text-base flex items-center gap-2">
						<i className="fas fa-bell"></i>
						Có {pendingCount} bài đăng đang chờ duyệt, vui lòng xử lý ngay.
					</p>
				</div>
			)}

			<div className="flex flex-wrap gap-2 mb-5">
				{[
					{ key: 'all', label: 'Tất cả' },
					{ key: 'pending', label: 'Chờ duyệt' },
					{ key: 'approved', label: 'Đã duyệt' },
					{ key: 'hidden', label: 'Đã ẩn' },
					{ key: 'removed', label: 'Đã gỡ' },
				].map((item) => (
					<button
						key={item.key}
						onClick={() => setFilter(item.key)}
						className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === item.key ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
					>
						{item.label}
					</button>
				))}
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr style={{ background: '#FFF7ED' }} className="text-amber-700 text-sm border-b border-amber-100">
								<th className="p-4 font-semibold">Mã bài</th>
								<th className="p-4 font-semibold">Tiêu đề</th>
								<th className="p-4 font-semibold">Chủ trọ</th>
								<th className="p-4 font-semibold">Giá</th>
								<th className="p-4 font-semibold">Trạng thái</th>
								<th className="p-4 font-semibold text-center">Thao tác</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{filteredPosts.length === 0 ? (
								<tr>
									<td colSpan="6" className="p-8 text-center text-gray-500">Không có bài đăng nào.</td>
								</tr>
							) : visiblePosts.map((post) => (
								<tr key={post.ID_Phong} className="hover:bg-gray-50 transition-colors">
									<td className="p-4 text-sm font-medium text-gray-900">#{post.ID_Phong}</td>
									<td className="p-4">
										<p className="text-sm font-bold text-gray-800 line-clamp-1">{post.TieuDe}</p>
										<p className="text-xs text-gray-500">{post.TenLoaiPhong || '---'}</p>
									</td>
									<td className="p-4">
										<p className="text-sm font-semibold text-gray-800">{post.TenChuTro || '---'}</p>
										<p className="text-xs text-gray-500">{post.EmailChuTro || ''}</p>
									</td>
									<td className="p-4 text-sm font-bold text-blue-700">{new Intl.NumberFormat('vi-VN').format(post.Gia || 0)} đ</td>
									<td className="p-4">
										{post.TrangThai === 'Chờ duyệt' && <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">Chờ duyệt</span>}
										{post.TrangThai === 'Đã ẩn' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Đã ẩn</span>}
										{post.TrangThai === 'Đã gỡ' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Đã gỡ</span>}
										{(!post.TrangThai || post.TrangThai === 'Còn trống' || post.TrangThai === 'Đang trống') && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Đã duyệt</span>}
										{post.TrangThai && !['Chờ duyệt', 'Đã ẩn', 'Đã gỡ', 'Còn trống', 'Đang trống'].includes(post.TrangThai) && (
											<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{post.TrangThai}</span>
										)}
									</td>
									<td className="p-4 text-center">
										<div className="flex flex-wrap justify-center gap-2">
											<button
												onClick={() => setPreviewPost(post)}
												className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
											>
												<i className="fas fa-eye text-[10px]"></i>
												Xem nhanh
											</button>

											{post.TrangThai === 'Chờ duyệt' && (
												<>
													<button
														onClick={() => updateStatus(post, 'duyet', 'Duyệt')}
														disabled={processingId === post.ID_Phong}
														className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
													>
														<i className="fas fa-check text-[10px]"></i>
														Duyệt
													</button>
													<button
														onClick={() => updateStatus(post, 'tu-choi', 'Từ chối')}
														disabled={processingId === post.ID_Phong || post.TrangThai === 'Đã gỡ'}
														className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
													>
														<i className="fas fa-ban text-[10px]"></i>
														Từ chối
													</button>
												</>
											)}

											{(!post.TrangThai || post.TrangThai === 'Còn trống' || post.TrangThai === 'Đang trống') && (
												<>
													<button
														onClick={() => updateStatus(post, 'an', 'Ẩn')}
														disabled={processingId === post.ID_Phong || post.TrangThai === 'Đã ẩn'}
														className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
													>
														<i className="fas fa-eye-slash text-[10px]"></i>
														Ẩn
													</button>
													<button
														onClick={() => updateStatus(post, 'tu-choi', 'Gỡ bài')}
														disabled={processingId === post.ID_Phong || post.TrangThai === 'Đã gỡ'}
														className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
													>
														<i className="fas fa-trash-alt text-[10px]"></i>
														Gỡ bài
													</button>
												</>
											)}

											{post.TrangThai === 'Đã ẩn' && (
												<>
													<button
														onClick={() => updateStatus(post, 'bo-an', 'Bỏ ẩn')}
														disabled={processingId === post.ID_Phong}
														className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
													>
														<i className="fas fa-eye text-[10px]"></i>
														Bỏ ẩn
													</button>
													<button
														onClick={() => updateStatus(post, 'tu-choi', 'Gỡ bài')}
														disabled={processingId === post.ID_Phong || post.TrangThai === 'Đã gỡ'}
														className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
													>
														<i className="fas fa-trash-alt text-[10px]"></i>
														Gỡ bài
													</button>
												</>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{hasMoreThanTen && (
					<div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
						<p className="text-xs md:text-sm text-gray-500 font-medium">
							Đang hiển thị {visiblePosts.length}/{filteredPosts.length} bài đăng
						</p>
						<button
							onClick={() => setShowAllPosts((prev) => !prev)}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
						>
							<i className={`fas ${showAllPosts ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
							{showAllPosts ? 'Thu gọn' : 'Xem tất cả'}
						</button>
					</div>
				)}
			</div>

			{previewPost && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewPost(null)}>
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
						<div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
							<h3 className="text-xl font-bold text-gray-800">Xem nhanh bài đăng #{previewPost.ID_Phong}</h3>
							<button className="text-gray-400 hover:text-gray-700" onClick={() => setPreviewPost(null)}>
								<i className="fas fa-times"></i>
							</button>
						</div>

						<div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								{previewPost.AnhDaiDien ? (
									<img
										src={getImageUrl(previewPost.AnhDaiDien)}
										alt={previewPost.TieuDe}
										className="w-full h-56 object-cover rounded-xl border border-gray-100"
									/>
								) : (
									<div className="w-full h-56 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
										Chưa có ảnh đại diện
									</div>
								)}
							</div>

							<div className="space-y-2 text-sm text-gray-700">
								<p className="text-base font-bold text-gray-900">{previewPost.TieuDe}</p>
								<p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN').format(previewPost.Gia || 0)} đ</p>
								<p><strong>Diện tích:</strong> {previewPost.DienTich || 0} m²</p>
								<p><strong>Địa chỉ:</strong> {previewPost.DiaChiChiTiet || '---'}</p>
								<p><strong>Trạng thái:</strong> {previewPost.TrangThai || 'Đã duyệt'}</p>
								<p><strong>Chủ trọ:</strong> {previewPost.TenChuTro || '---'} ({previewPost.EmailChuTro || '---'})</p>
								<div className="pt-3">
									<a
										href={`/phong-tro/${previewPost.ID_Phong}`}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
									>
										<i className="fas fa-external-link-alt"></i>
										Xem trang chi tiết
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminQuanLyBaiDang;
