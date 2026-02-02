'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionForm from '@/components/SectionForm';

interface Section {
    id: string;
    name: string;
    description: string;
    is_free: boolean;
    price: number;
    downloads_count: number;
    is_active: boolean;
    categories: {
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function AdminPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState({ total: 0, free: 0, paid: 0, installs: 0 });
    const [showModal, setShowModal] = useState(false);
    const [currentSection, setCurrentSection] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data
    useEffect(() => {
        fetchSections();
        fetchCategories();
    }, []);

    async function fetchSections() {
        try {
            const res = await fetch('/api/admin/sections');
            const data = await res.json();
            setSections(data.sections || []);

            // Calculate stats
            const total = data.sections?.length || 0;
            const free = data.sections?.filter((s: Section) => s.is_free).length || 0;
            const paid = total - free;
            const installs = data.sections?.reduce((sum: number, s: Section) => sum + s.downloads_count, 0) || 0;

            setStats({ total, free, paid, installs });
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this section?')) return;

        try {
            const res = await fetch(`/api/admin/sections?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchSections();
                alert('✅ Section deleted successfully');
            } else {
                alert('❌ Failed to delete section');
            }
        } catch (error) {
            alert('❌ Failed to delete section');
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--color-bg))]">
            {/* Header */}
            <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]/50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-playfair)]">
                        <span className="gradient-text">Admin Dashboard</span>
                    </h1>
                    <p className="text-[hsl(var(--color-text-muted))] mt-2">Manage your section library</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Total Sections" value={stats.total} icon="📦" />
                    <StatsCard title="Free Sections" value={stats.free} icon="🎁" />
                    <StatsCard title="Paid Sections" value={stats.paid} icon="💰" />
                    <StatsCard title="Total Installs" value={stats.installs} icon="📥" />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">All Sections</h2>
                    <button
                        onClick={() => {
                            setCurrentSection(null);
                            setShowModal(true);
                        }}
                        className="btn-primary"
                    >
                        + Create Section
                    </button>
                </div>

                {/* Sections Table */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin text-6xl">⚙️</div>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[hsl(var(--color-surface))] border-b border-[hsl(var(--color-border))]">
                                <tr>
                                    <th className="text-left p-4 font-semibold">Name</th>
                                    <th className="text-left p-4 font-semibold">Category</th>
                                    <th className="text-left p-4 font-semibold">Price</th>
                                    <th className="text-left p-4 font-semibold">Installs</th>
                                    <th className="text-left p-4 font-semibold">Status</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((section) => (
                                    <tr
                                        key={section.id}
                                        className="border-b border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-surface))]/30 transition-colors"
                                    >
                                        <td className="p-4">{section.name}</td>
                                        <td className="p-4 text-[hsl(var(--color-text-muted))]">
                                            {section.categories?.name || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            {section.is_free ? (
                                                <span className="text-green-500 font-semibold">FREE</span>
                                            ) : (
                                                `$${section.price}`
                                            )}
                                        </td>
                                        <td className="p-4">{section.downloads_count}</td>
                                        <td className="p-4">
                                            {section.is_active ? (
                                                <span className="text-green-500">● Active</span>
                                            ) : (
                                                <span className="text-gray-500">● Inactive</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setCurrentSection(section);
                                                    setShowModal(true);
                                                }}
                                                className="text-[hsl(var(--color-primary))] hover:underline mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(section.id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <SectionForm
                    categories={categories}
                    initialData={currentSection}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchSections();
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
}

function StatsCard({ title, value, icon }: { title: string; value: number; icon: string }) {
    return (
        <motion.div
            className="glass-card p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{icon}</span>
                <span className="text-4xl font-bold gradient-text">{value}</span>
            </div>
            <p className="text-sm text-[hsl(var(--color-text-muted))]">{title}</p>
        </motion.div>
    );
}
