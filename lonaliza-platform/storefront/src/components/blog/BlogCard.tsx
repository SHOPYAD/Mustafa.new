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
        <article className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 hover:-translate-y-2 border border-slate-100 dark:border-slate-800">
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
                    <span className="px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700">
                        {post.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                </p>

                {/* CTA */}
                <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all"
                >
                    Read More
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    );
}
