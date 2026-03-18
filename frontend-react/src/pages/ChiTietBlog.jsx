import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import blogPosts from '../data/blogData';

function BlogDetail() {
    const { id } = useParams();
    const post = blogPosts.find(p => p.id === parseInt(id));

    // Cuộn lên đầu trang khi mở bài viết
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mô bài viết không tồn tại</h2>
                <Link to="/blog" className="text-blue-600 hover:underline">Quay lại trang Blog</Link>
            </div>
        );
    }

    const otherPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 2);

    return (
        <div className="min-h-screen">
            <Helmet>
                <title>{post.title} - OZIC HOUSE</title>
                <meta name="description" content={post.excerpt} />
            </Helmet>

            {/* Header / Hero */}
            <header className="relative h-[400px] md:h-[500px] overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <div className="container mx-auto max-w-4xl">
                        <div className="flex gap-3 mb-4">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                                <i className="far fa-calendar-alt mr-1"></i> {post.date}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {post.author.charAt(0)}
                            </div>
                            <span className="font-medium">{post.author}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-4xl px-4 py-16">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Article Content */}
                    <article className="flex-grow">
                        <div
                            className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed 
                                     prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                                     prose-p:mb-6 prose-strong:text-gray-900"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Social Share & Tags */}
                        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex gap-2">
                                <span className="bg-gray-100 px-4 py-1.5 rounded-lg text-sm text-gray-600">#thuephong</span>
                                <span className="bg-gray-100 px-4 py-1.5 rounded-lg text-sm text-gray-600">#kinhnghiem</span>
                                <span className="bg-gray-100 px-4 py-1.5 rounded-lg text-sm text-gray-600">#ozichouse</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm font-medium">Chia sẻ:</span>
                                <div className="flex gap-3">
                                    <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                                        <i className="fab fa-facebook-f"></i>
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition">
                                        <i className="fab fa-twitter"></i>
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-gray-800 hover:text-white transition">
                                        <i className="fas fa-link"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Author Bio */}
                        <div className="mt-12 bg-gray-50 rounded-3xl p-8 flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">{post.author}</h4>
                                <p className="text-gray-600 text-sm">Chuyên gia nội dung tại OZIC HOUSE, luôn nỗ lực mang lại những kiến thức hữu ích nhất cho cộng đồng thuê nhà tại Việt Nam.</p>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar / Related */}
                    <aside className="w-full md:w-80 shrink-0">
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Bài viết liên quan
                                </h3>
                                <div className="space-y-6">
                                    {otherPosts.map(p => (
                                        <Link key={p.id} to={`/blog/${p.id}`} className="group flex gap-4">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                                <img src={p.image} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" alt={p.title} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition mb-1">{p.title}</h5>
                                                <span className="text-xs text-gray-400">{p.date}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-600 rounded-3xl p-8 text-white">
                                <h3 className="font-bold text-xl mb-3">Tìm phòng ngay?</h3>
                                <p className="text-blue-100 text-sm mb-6 leading-relaxed">Khám phá hàng ngàn phòng trọ uy tín, đã được kiểm duyệt tại OZIC HOUSE.</p>
                                <Link to="/tim-phong" className="block w-full text-center bg-white text-blue-600 font-bold py-3 rounded-xl hover:shadow-lg transition">
                                    Bắt đầu ngay
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default BlogDetail;
