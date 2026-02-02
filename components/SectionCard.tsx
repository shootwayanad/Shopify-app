'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

interface SectionCardProps {
    section: Section;
    onInstall: (sectionId: string) => void;
    onUninstall?: (sectionId: string) => void;
    isInstalling?: boolean;
}

export default function SectionCard({ section, onInstall, onUninstall, isInstalling }: SectionCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    async function handleInstallClick() {
        if (!section.is_free && section.price > 0) {
            // Get shop domain from URL
            const shopDomain = new URLSearchParams(window.location.search).get('shop');

            if (!shopDomain) {
                alert('Please install this app from your Shopify store');
                return;
            }

            // Trigger payment flow
            try {
                const res = await fetch('/api/billing/purchase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shopDomain,
                        sectionId: section.id
                    })
                });

                const data = await res.json();
                if (data.confirmationUrl) {
                    window.top!.location.href = data.confirmationUrl;
                } else {
                    alert('Failed to initiate payment');
                }
            } catch (error) {
                alert('Payment error. Please try again.');
            }
        } else {
            onInstall(section.id);
        }
    }

    return (
        <motion.div
            className="glass-card overflow-hidden group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            {/* Preview Image */}
            <div className="relative h-48 overflow-hidden bg-[hsl(var(--color-surface))]">
                {section.preview_image_url ? (
                    <img
                        src={section.preview_image_url}
                        alt={section.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[hsl(var(--color-text-muted))] text-4xl">📦</span>
                    </div>
                )}

                {/* Overlay on Hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end p-4 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {onUninstall ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUninstall(section.id);
                            }}
                            disabled={isInstalling}
                            className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            {isInstalling ? 'Removing...' : 'Uninstall Section'}
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleInstallClick();
                            }}
                            disabled={isInstalling}
                            className="btn-primary w-full"
                        >
                            {isInstalling ? 'Installing...' : section.is_free ? 'Install Section' : `Buy for $${section.price}`}
                        </button>
                    )}
                </motion.div>

                {/* Price Badge */}
                {section.is_free ? (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        FREE
                    </div>
                ) : (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] text-white text-xs font-bold rounded-full">
                        ${section.price}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-[hsl(var(--color-text))] line-clamp-1">
                        {section.name}
                    </h3>
                </div>

                <p className="text-sm text-[hsl(var(--color-text-muted))] mb-3 line-clamp-2">
                    {section.description}
                </p>

                {/* Category Badge */}
                <div className="mb-3">
                    <span className="inline-block px-2 py-1 text-xs bg-[hsl(var(--color-surface))] text-[hsl(var(--color-primary))] rounded-md border border-[hsl(var(--color-border))]">
                        {section.categories?.name || 'Uncategorized'}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-[hsl(var(--color-text-muted))]">
                    <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{section.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>📥</span>
                        <span>{section.downloads_count} installs</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
