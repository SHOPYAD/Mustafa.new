// src/components/blog/BlogCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, User } from "lucide-react";

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    author: string;
    date: string;
    slug: string;
}

interface BlogCardProps {
    post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
    return (
        <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-bold rounded-full">
                        {post.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                </p>

                {/* CTA */}
                <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all"
                >
                    Read More
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    );
}
