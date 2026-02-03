'use client';

import { useEffect, useState } from 'react';
import { NavMenu, TitleBar } from '@shopify/app-bridge-react';
import {
    Page,
    Card,
    TextField,
    Text,
    Box,
    InlineStack,
    BlockStack,
    Spinner,
    EmptyState,
    Button,
    Toast,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

interface Section {
    id: string;
    name: string;
    description: string;
    preview_image_url: string;
    is_free: boolean;
    price: number;
    downloads_count: number;
    rating: number;
    categories?: {
        id: string;
        name: string;
        slug: string;
        icon: string;
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
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [toastActive, setToastActive] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchSections();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchSections = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            const response = await fetch(`/api/sections?${params}`);
            const data = await response.json();
            setSections(data.sections || []);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (sectionId: string) => {
        const shopDomain = new URLSearchParams(window.location.search).get('shop');
        if (!shopDomain) {
            setToastMessage('Shop domain not found. Please reinstall the app.');
            setToastActive(true);
            return;
        }
        setInstalling(sectionId);
        try {
            const response = await fetch('/api/sections/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionId, shopDomain }),
            });
            const data = await response.json();
            if (response.ok) {
                setToastMessage(
                    `"${data.sectionFileName}" installed! Find it in your theme editor.`
                );
            } else {
                setToastMessage(data.error || 'Failed to install section');
            }
            setToastActive(true);
        } catch (error) {
            setToastMessage('Failed to install section');
            setToastActive(true);
        } finally {
            setInstalling(null);
        }
    };

    const filteredSections = sections.filter(
        (section) =>
            section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (section.description || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    return (
        <Page>
            {/* App Bridge v4: Native Shopify chrome */}
            <TitleBar title="Section Store" />
            <NavMenu>
                <a href="/" rel="home">
                    Explore Sections
                </a>
                <a href="/?view=installed">My Sections</a>
                <a href="/?view=bundles">Bundle &amp; Save</a>
                <a href="/?view=help">Helpcenter</a>
                <a href="/?view=inspiration">Section Inspiration</a>
            </NavMenu>

            {/* Search bar - full width, no card wrapper */}
            <Box paddingBlockEnd="300">
                <TextField
                    label="Search"
                    labelHidden
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                    placeholder="Search for sections, categories, or styles..."
                    prefix={<SearchIcon />}
                    clearButton
                    onClearButtonClick={() => setSearchQuery('')}
                    autoComplete="off"
                />
            </Box>

            {/* Category pills - horizontal row */}
            <Box paddingBlockEnd="400">
                <InlineStack gap="200" wrap={false} align="center">
                    <Button
                        size="slim"
                        variant={selectedCategory === '' ? 'primary' : 'secondary'}
                        onClick={() => setSelectedCategory('')}
                    >
                        Popular
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            size="slim"
                            variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </InlineStack>
            </Box>

            {/* Loading spinner */}
            {loading && (
                <Box paddingBlock="1000">
                    <InlineStack align="center">
                        <Spinner accessibilityLabel="Loading sections" size="large" />
                    </InlineStack>
                </Box>
            )}

            {/* 3-column card grid */}
            {!loading && filteredSections.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                    }}
                >
                    {filteredSections.map((section) => (
                        <Card key={section.id}>
                            {/* Preview image */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    overflow: 'hidden',
                                    borderRadius: '8px 8px 0 0',
                                    backgroundColor: '#f4f4f5',
                                }}
                            >
                                {section.preview_image_url ? (
                                    <img
                                        src={section.preview_image_url}
                                        alt={section.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '48px',
                                            opacity: 0.15,
                                        }}
                                    >
                                        📄
                                    </div>
                                )}
                            </div>

                            {/* Card body */}
                            <Box padding="300">
                                <BlockStack gap="100">
                                    {/* Name + Price on same line */}
                                    <InlineStack align="center" blockAlign="center">
                                        <Box width="100%">
                                            <Text as="h3" variant="headingSm" fontWeight="bold">
                                                {section.name}
                                            </Text>
                                        </Box>
                                        <Text
                                            as="span"
                                            variant="bodyMd"
                                            fontWeight="semibold"
                                            tone={section.is_free ? 'success' : 'base'}
                                        >
                                            {section.is_free ? 'Free' : `$${section.price}`}
                                        </Text>
                                    </InlineStack>

                                    {/* Description */}
                                    <Text as="p" variant="bodySm" tone="subdued">
                                        {section.description || 'Enhance your store with this section'}
                                    </Text>

                                    {/* Install button */}
                                    <Box paddingBlockStart="200">
                                        <Button
                                            variant="primary"
                                            size="slim"
                                            fullWidth
                                            onClick={() => handleInstall(section.id)}
                                            disabled={installing === section.id}
                                            loading={installing === section.id}
                                        >
                                            Install Section
                                        </Button>
                                    </Box>
                                </BlockStack>
                            </Box>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filteredSections.length === 0 && (
                <EmptyState heading="No sections found" image="">
                    <p>Try adjusting your search or browse a different category.</p>
                </EmptyState>
            )}

            {/* Toast notifications (replaces alert()) */}
            {toastActive && (
                <Toast content={toastMessage} onDismiss={() => setToastActive(false)} />
            )}
        </Page>
    );
}
