import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogData';

function Blog() {
    return (
        <div className="min-h-screen">
            <Helmet>
                <title>Blog - OZIC HOUSE</title>
                <meta name="description" content="Bài viết chia sẻ kinh nghiệm tìm phòng trọ, đàm phán giá và các mẹo hữu ích cho người thuê nhà." />
            </Helmet>

            <div className="container mx-auto max-w-6xl py-16 px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Cẩm nang thuê phòng</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">Những kinh nghiệm và mẹo hữu ích giúp bạn tìm được không gian sống lý tưởng và an tâm nhất.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {blogPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group">
                            <div className="relative h-56 overflow-hidden">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm uppercase tracking-wide">
                                    {post.category || 'Kinh nghiệm'}
                                </div>
                            </div>
                            <div className="p-8 flex-grow flex flex-col">
                                <div className="text-xs text-gray-400 font-medium mb-3 flex items-center gap-2">
                                    <i className="far fa-calendar-alt"></i> {post.date}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed opacity-80">{post.excerpt}</p>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <Link to={`/blog/${post.id}`} className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2 group/btn transition-all">
                                        Đọc thêm
                                        <i className="fas fa-arrow-right text-xs group-hover/btn:translate-x-1 transition-transform"></i>
                                    </Link>
                                    <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <i className="far fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Blog;
