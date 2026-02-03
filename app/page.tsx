'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    InlineStack,
    BlockStack,
    Text,
    TextField,
    Button,
    UnstyledButton,
    Icon,
    Spinner,
    EmptyState,
    Layout,
    Card,
    Badge
} from '@shopify/polaris';
import {
    SearchIcon,
    FilterIcon,
    StarFilledIcon,
    AppsIcon,
    ViewIcon,
    PlusIcon,
    HeartIcon
} from '@shopify/polaris-icons';
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

    // Get shop domain from URL and clean it
    const rawShop = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('shop')
        : null;

    const shopDomain = rawShop
        ? rawShop.replace(/^https?:\/\//, '').replace(/\/$/, '')
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
                if (res.status === 404) {
                    const retry = confirm(`❌ ${data.error}\n\nThis usually happens if your shop isn't registered yet. Would you like to try re-authenticating your store?`);
                    if (retry) {
                        window.location.href = `/api/auth?shop=${shopDomain}`;
                    }
                } else {
                    alert(`❌ Installation failed: ${data.error}`);
                }
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

    async function handlePurchaseFlow(section: Section) {
        if (!shopDomain) return;

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
    }

    return (
        <Box background="bg-surface" minHeight="100vh">
            {/* Header Content Inline to avoid reference issues */}
            <Box padding="400" background="bg-surface" borderBlockEndWidth="025">
                <InlineStack align="space-between" blockAlign="center" gap="400">
                    <InlineStack gap="200" blockAlign="center">
                        <Box background="bg-fill-brand-active" padding="200" borderRadius="200">
                            <Text as="span" variant="headingMd" tone="base">S</Text>
                        </Box>
                        <Text as="h1" variant="headingMd">Section Store</Text>
                    </InlineStack>

                    <Box width="60%">
                        <TextField
                            label="Search for sections"
                            labelHidden
                            value={searchQuery}
                            onChange={(value) => setSearchQuery(value)}
                            placeholder="Search for sections"
                            prefix={<Icon source={SearchIcon} />}
                            autoComplete="off"
                        />
                    </Box>

                    <InlineStack gap="200">
                        <Button
                            icon={FilterIcon}
                            onClick={() => { }}
                        >
                            Categories
                        </Button>
                        <Button variant="primary" onClick={() => setShowSubscriptionModal(true)}>
                            Subscribe
                        </Button>
                    </InlineStack>
                </InlineStack>
            </Box>

            <Box paddingInlineStart="400" paddingInlineEnd="400" paddingBlockStart="400" paddingBlockEnd="400">
                {/* Category Pills */}
                <Box paddingBlockEnd="600">
                    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '16px', paddingBottom: '12px', paddingLeft: '4px' }}>
                        <UnstyledButton
                            onClick={() => setSelectedCategory('all')}
                        >
                            <Box
                                padding="200"
                                borderRadius="200"
                                background={selectedCategory === 'all' ? 'bg-fill-brand' : undefined}
                            >
                                <BlockStack align="center" inlineAlign="center" gap="100">
                                    <Icon source={StarFilledIcon} tone={selectedCategory === 'all' ? 'base' : 'subdued'} />
                                    <Text as="span" variant="bodySm" fontWeight={selectedCategory === 'all' ? 'bold' : 'regular'}>Popular</Text>
                                </BlockStack>
                            </Box>
                        </UnstyledButton>
                        <UnstyledButton
                            onClick={() => setSelectedCategory('installed')}
                        >
                            <Box
                                padding="200"
                                borderRadius="200"
                                background={selectedCategory === 'installed' ? 'bg-fill-brand' : undefined}
                            >
                                <BlockStack align="center" inlineAlign="center" gap="100">
                                    <Icon source={AppsIcon} tone={selectedCategory === 'installed' ? 'base' : 'subdued'} />
                                    <Text as="span" variant="bodySm" fontWeight={selectedCategory === 'installed' ? 'bold' : 'regular'}>My Sections</Text>
                                </BlockStack>
                            </Box>
                        </UnstyledButton>
                        {categories.map((cat) => (
                            <UnstyledButton
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug)}
                            >
                                <Box
                                    padding="200"
                                    borderRadius="200"
                                    background={selectedCategory === cat.slug ? 'bg-fill-brand' : undefined}
                                >
                                    <BlockStack align="center" inlineAlign="center" gap="100">
                                        <Text as="span" variant="bodyLg">{cat.icon || '✨'}</Text>
                                        <Text as="span" variant="bodySm" fontWeight={selectedCategory === cat.slug ? 'bold' : 'regular'}>{cat.name}</Text>
                                    </BlockStack>
                                </Box>
                            </UnstyledButton>
                        ))}
                    </div>
                </Box>

                {/* Section Content */}
                {loading ? (
                    <Box padding="1000">
                        <InlineStack align="center">
                            <Spinner size="large" />
                        </InlineStack>
                    </Box>
                ) : sections.length === 0 ? (
                    <EmptyState
                        heading="No sections found"
                        action={{ content: 'Browse all', onAction: () => setSelectedCategory('all') }}
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                        <p>Try adjusting your search or category filters.</p>
                    </EmptyState>
                ) : (
                    <BlockStack gap="600">
                        <Text as="h2" variant="headingMd">
                            {selectedCategory === 'all' ? 'Trending Now' :
                                selectedCategory === 'installed' ? 'My Library' :
                                    categories.find(c => c.slug === selectedCategory)?.name || 'Results'}
                        </Text>

                        <Layout>
                            {sections.map((section) => (
                                <Layout.Section key={section.id} variant="oneThird">
                                    <Card padding="0">
                                        <Box position="relative">
                                            <Box
                                                minHeight="160px"
                                                background="bg-surface-secondary"
                                                borderRadius="200"
                                            >
                                                {section.preview_image_url ? (
                                                    <img
                                                        src={section.preview_image_url}
                                                        alt={section.name}
                                                        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box padding="1000">
                                                        <InlineStack align="center">
                                                            <Icon source={ViewIcon} tone="subdued" />
                                                        </InlineStack>
                                                    </Box>
                                                )}
                                            </Box>

                                            <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                <Badge tone={section.is_free ? 'success' : 'info'}>
                                                    {section.is_free ? 'FREE' : `$${section.price}`}
                                                </Badge>
                                            </div>
                                        </Box>

                                        <Box padding="400">
                                            <BlockStack gap="200">
                                                <InlineStack align="space-between" blockAlign="center">
                                                    <Text as="h3" variant="bodyMd" fontWeight="bold">
                                                        {section.name} {section.price >= 10 && <Icon source={HeartIcon} tone="info" />}
                                                    </Text>
                                                </InlineStack>

                                                <Text as="p" variant="bodySm" tone="subdued" breakWord>
                                                    {section.description || 'No description available'}
                                                </Text>

                                                <Box paddingBlockStart="200">
                                                    {selectedCategory === 'installed' ? (
                                                        <Button
                                                            variant="primary"
                                                            tone="critical"
                                                            fullWidth
                                                            onClick={() => handleUninstall(section.id)}
                                                            loading={installing === section.id}
                                                        >
                                                            Uninstall
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            fullWidth
                                                            onClick={() => {
                                                                if (section.is_free || section.price === 0) {
                                                                    handleInstall(section.id);
                                                                } else {
                                                                    handlePurchaseFlow(section);
                                                                }
                                                            }}
                                                            loading={installing === section.id}
                                                        >
                                                            {section.is_free ? 'Install Section' : `Buy - $${section.price}`}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </BlockStack>
                                        </Box>
                                    </Card>
                                </Layout.Section>
                            ))}
                        </Layout>
                    </BlockStack>
                )}
            </Box>

            {showSubscriptionModal && shopDomain && (
                <SubscriptionModal
                    shopDomain={shopDomain}
                    onCloseAction={() => setShowSubscriptionModal(false)}
                />
            )}

            <Box padding="1000">
                <Text as="p" alignment="center">
                    <Button variant="plain" onClick={() => window.location.href = '/admin'}>Admin Access</Button>
                </Text>
            </Box>
        </Box>
    );
}
