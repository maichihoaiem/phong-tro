import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import blogPosts from '../data/blogData';

const BlogCard = ({ id, title, date, excerpt, image }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                border: '1px solid #F1F5F9',
                boxShadow: isHovered ? '0 20px 40px rgba(15, 28, 63, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                transform: isHovered ? 'translateY(-8px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img 
                    src={image} 
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#2563EB',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(4px)'
                }}>
                    {date}
                </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 800, 
                    color: '#0F1C3F', 
                    marginBottom: '10px',
                    lineHeight: '1.3',
                    transition: 'color 0.3s ease'
                }}>{title}</h3>
                <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#64748B', 
                    lineHeight: '1.5',
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                }}>{excerpt}</p>
                
                <Link to={`/blog/${id}`} className="btn-premium btn-premium-outline" style={{
                    padding: '12px 20px',
                    fontSize: '0.9rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: 'fit-content'
                }}>
                    Đọc bài viết <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                </Link>
            </div>
        </div>
    );
};

function BlogPreview() {
    // Lấy 3 bài viết mới nhất
    const blogs = blogPosts.slice(0, 3);

    return (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline', 
                marginBottom: '32px' 
            }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F1C3F', marginBottom: '8px' }}>
                        Cẩm nang thuê phòng
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Cập nhật những thông tin và kiến thức bổ ích mới nhất</p>
                </div>
                <Link to="/blog" style={{ 
                    color: '#2563EB', 
                    fontWeight: 700, 
                    fontSize: '1rem'
                }}>
                    Xem tất cả bài viết <i className="fas fa-chevron-right" style={{ fontSize: '0.8rem' }}></i>
                </Link>
            </div>

            <div 
                className="blog-grid"
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '24px' 
                }}
            >
                {blogs.map((b, i) => (
                    <BlogCard key={i} {...b} />
                ))}
            </div>
        </section>
    );
}

export default BlogPreview;
