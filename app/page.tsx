'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionCard from '@/components/SectionCard';
import SubscriptionModal from '@/components/SubscriptionModal';

interface Section {
    id: string;
    name: string;
    description: string;
    preview_image_url: string;
    is_free: boolean;
    price: number;
    downloads_count: number;
    rating: number;
    categories: {
        name: string;
        slug: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
}

export default function HomePage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [installing, setInstalling] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    // Get shop domain from URL
    const shopDomain = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('shop')
        : null;

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                setCategories(data.categories || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        }
        fetchCategories();
    }, []);

    // Fetch sections
    useEffect(() => {
        async function fetchSections() {
            setLoading(true);
            try {
                if (selectedCategory === 'installed') {
                    const res = await fetch(`/api/sections/installed?shop=${shopDomain}`);
                    const data = await res.json();
                    setSections(data.sections || []);
                } else {
                    const params = new URLSearchParams();
                    if (selectedCategory !== 'all') {
                        params.set('category', selectedCategory);
                    }
                    if (searchQuery) {
                        params.set('search', searchQuery);
                    }
                    const res = await fetch(`/api/sections?${params.toString()}`);
                    const data = await res.json();
                    setSections(data.sections || []);
                }
            } catch (error) {
                console.error('Failed to fetch sections:', error);
            } finally {
                setLoading(false);
            }
        }

        const debounce = setTimeout(fetchSections, 300);
        return () => clearTimeout(debounce);
    }, [selectedCategory, searchQuery, shopDomain]);

    // Install section
    async function handleInstall(sectionId: string) {
        if (!shopDomain) {
            alert('Please install this app from your Shopify store');
            return;
        }

        setInstalling(sectionId);
        try {
            const res = await fetch('/api/sections/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopDomain, sectionId }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('✅ Section installed successfully! Check your theme editor.');
            } else {
                alert(`❌ Installation failed: ${data.error}`);
            }
        } catch (error) {
            alert('❌ Installation failed. Please try again.');
        } finally {
            setInstalling(null);
        }
    }

    async function handleUninstall(sectionId: string) {
        if (!confirm('Are you sure you want to remove this section from your theme?')) return;

        setInstalling(sectionId);
        try {
            const res = await fetch(`/api/sections/uninstall?shop=${shopDomain}&id=${sectionId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('✅ Section removed successfully');
                if (selectedCategory === 'installed') {
                    setSections(sections.filter(s => s.id !== sectionId));
                }
            } else {
                alert('❌ Failed to remove section');
            }
        } catch (error) {
            alert('❌ Error during uninstallation');
        } finally {
            setInstalling(null);
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--color-bg))]">
            {/* Header */}
            <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]/50 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-4xl font-bold font-[family-name:var(--font-playfair)]">
                            <span className="gradient-text">Section House</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            {shopDomain && (
                                <>
                                    <span className="text-sm text-[hsl(var(--color-text-muted))]">
                                        Connected: {shopDomain}
                                    </span>
                                    <button
                                        onClick={() => window.location.href = `/billing?shop=${shopDomain}`}
                                        className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-lg text-sm hover:bg-white/5 transition-colors"
                                    >
                                        Billing History
                                    </button>
                                    <button
                                        onClick={() => setShowSubscriptionModal(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        ⭐ Subscribe
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search sections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Category Tabs */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedCategory === 'all'
                            ? 'bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white'
                            : 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]'
                            }`}
                    >
                        All Sections
                    </button>
                    <button
                        onClick={() => setSelectedCategory('installed')}
                        className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedCategory === 'installed'
                            ? 'bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white shadow-lg'
                            : 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))]'
                            }`}
                    >
                        📁 My Sections
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedCategory === cat.slug
                                ? 'bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white'
                                : 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Sections Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin text-6xl">⚙️</div>
                        <p className="mt-4 text-[hsl(var(--color-text-muted))]">Loading sections...</p>
                    </div>
                ) : sections.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-[hsl(var(--color-text-muted))]">No sections found</p>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {sections.map((section, index) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                            >
                                <SectionCard
                                    section={section}
                                    onInstall={handleInstall}
                                    onUninstall={selectedCategory === 'installed' ? handleUninstall : undefined}
                                    isInstalling={installing === section.id}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Subscription Modal */}
            {showSubscriptionModal && shopDomain && (
                <SubscriptionModal
                    shopDomain={shopDomain}
                    onCloseAction={() => setShowSubscriptionModal(false)}
                />
            )}
        </div>
    );
}
