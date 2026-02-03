'use client';

import { useEffect, useState } from 'react';
import {
    Page,
    TextField,
    Button,
    Box,
    InlineStack,
    Spinner,
    EmptyState,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { UpgradeBanner } from '@/components/landing/UpgradeBanner';
import { CategoryIconGrid } from '@/components/landing/CategoryIconGrid';
import { SectionShowcase } from '@/components/landing/SectionShowcase';

interface Section {
    id: string;
    name: string;
    description: string;
    preview_image_url: string;
    is_free: boolean;
    price: number;
    downloads_count: number;
    created_at: string;
}

export default function LandingPage() {
    const [allSections, setAllSections] = useState<Section[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('popular');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const response = await fetch('/api/sections');
            const data = await response.json();
            setAllSections(data.sections || []);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter sections based on search and category
    const filteredSections = allSections.filter((section) => {
        const matchesSearch =
            searchQuery === '' ||
            section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (section.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    // Get trending sections (most downloads)
    const trendingSections = [...filteredSections]
        .sort((a, b) => b.downloads_count - a.downloads_count)
        .slice(0, 4);

    // Get newest sections
    const newestSections = [...filteredSections]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4);

    // Get free sections
    const freeSections = filteredSections.filter((s) => s.is_free).slice(0, 4);

    const handleViewDetails = (id: string) => {
        // Navigate to section details or open modal
        console.log('View section:', id);
    };

    return (
        <div style={{ background: '#f6f6f7', minHeight: '100vh' }}>
            {/* Upgrade Banner */}
            <UpgradeBanner />

            {/* Main Content */}
            <Box padding="600">
                {/* Search Section */}
                <Box paddingBlockEnd="400">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <InlineStack gap="200" align="center">
                            <div style={{ flex: 1 }}>
                                <TextField
                                    label="Search"
                                    labelHidden
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search for sections"
                                    prefix={<SearchIcon />}
                                    autoComplete="off"
                                />
                            </div>
                            <Button variant="primary">
                                Start Your Search
                            </Button>
                            <Button>Categories ▾</Button>
                        </InlineStack>
                    </div>
                </Box>

                {/* Category Icons */}
                <CategoryIconGrid
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />

                {/* Loading State */}
                {loading && (
                    <Box paddingBlock="1000">
                        <InlineStack align="center">
                            <Spinner accessibilityLabel="Loading sections" size="large" />
                        </InlineStack>
                    </Box>
                )}

                {/* Content Sections */}
                {!loading && (
                    <>
                        {/* Trending Now */}
                        {trendingSections.length > 0 && (
                            <SectionShowcase
                                title="Trending Now"
                                sections={trendingSections}
                                onViewDetails={handleViewDetails}
                            />
                        )}

                        {/* Newest Releases */}
                        {newestSections.length > 0 && (
                            <SectionShowcase
                                title="Newest Releases"
                                sections={newestSections}
                                onViewDetails={handleViewDetails}
                            />
                        )}

                        {/* Free Sections */}
                        {freeSections.length > 0 && (
                            <SectionShowcase
                                title="Free"
                                sections={freeSections}
                                onViewDetails={handleViewDetails}
                            />
                        )}

                        {/* Empty State */}
                        {filteredSections.length === 0 && (
                            <EmptyState heading="No sections found" image="">
                                <p>Try adjusting your search or browse a different category.</p>
                            </EmptyState>
                        )}
                    </>
                )}
            </Box>
        </div>
    );
}
