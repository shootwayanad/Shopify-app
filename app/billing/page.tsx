'use client';

import { useEffect, useState } from 'react';
import {
    Page,
    Layout,
    Card,
    Box,
    BlockStack,
    InlineStack,
    Text,
    Badge,
    Spinner,
    IndexTable,
    EmptyState,
    Button
} from '@shopify/polaris';

interface SubscriptionDetails {
    status: string;
    plan: string;
    expires_at: string;
}

interface Charge {
    id: string;
    charge_type: string;
    amount: number;
    status: string;
    created_at: string;
    section_name?: string;
}

export default function BillingPage() {
    const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
    const [charges, setCharges] = useState<Charge[]>([]);
    const [loading, setLoading] = useState(true);

    const shopDomain = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('shop')
        : null;

    useEffect(() => {
        if (shopDomain) {
            fetchBillingData();
        }
    }, [shopDomain]);

    async function fetchBillingData() {
        try {
            const res = await fetch(`/api/merchant/billing?shop=${shopDomain}`);
            const data = await res.json();
            setSubscription(data.subscription);
            setCharges(data.charges || []);
        } catch (error) {
            console.error('Failed to fetch billing data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!shopDomain) {
        return (
            <Page>
                <EmptyState
                    heading="Shop not found"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>Please access this page from your Shopify admin panel.</p>
                </EmptyState>
            </Page>
        );
    }

    const rowMarkup = charges.map(
        ({ id, charge_type, amount, status, created_at, section_name }, index) => (
            <IndexTable.Row id={id} key={id} position={index}>
                <IndexTable.Cell>
                    {new Date(created_at).toLocaleDateString()}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {charge_type === 'subscription' ? 'Plan Subscription' : `Section: ${section_name || 'Premium'}`}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone="info">{charge_type}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">${amount.toFixed(2)}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={status === 'active' ? 'success' : 'attention'}>
                        {status.toUpperCase()}
                    </Badge>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <Page
            title="Billing & Subscriptions"
            subtitle="Manage your payment history and plans"
            backAction={{
                content: 'Back to Gallery',
                onAction: () => window.location.href = `/?shop=${shopDomain}`
            }}
        >
            {loading ? (
                <Box padding="1000" textAlign="center">
                    <Spinner size="large" />
                    <Box paddingBlockStart="400">
                        <Text as="p" tone="subdued">Loading billing details...</Text>
                    </Box>
                </Box>
            ) : (
                <Layout>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <Text as="h2" variant="headingMd">🛡️ Current Plan</Text>

                                    <BlockStack gap="200">
                                        <Text as="p" variant="bodySm" tone="subdued">Plan Status</Text>
                                        <InlineStack gap="200" blockAlign="center">
                                            <Text as="p" variant="headingLg" tone={subscription?.status === 'active' ? 'success' : 'subdued'}>
                                                {subscription?.status === 'active' ? 'Active' : 'No Active Subscription'}
                                            </Text>
                                            {subscription?.status === 'active' && (
                                                <Badge tone="success" progress="complete" size="small" />
                                            )}
                                        </InlineStack>
                                    </BlockStack>

                                    {subscription?.status === 'active' && (
                                        <BlockStack gap="300">
                                            <Box>
                                                <Text as="p" variant="bodySm" tone="subdued">Current Plan</Text>
                                                <Text as="p" variant="bodyMd" fontWeight="bold">{subscription.plan}</Text>
                                            </Box>
                                            <Box>
                                                <Text as="p" variant="bodySm" tone="subdued">Next Billing Date</Text>
                                                <Text as="p" variant="bodyMd" fontWeight="bold">
                                                    {new Date(subscription.expires_at).toLocaleDateString()}
                                                </Text>
                                            </Box>
                                            <Button tone="critical" onClick={() => { }}>Cancel Subscription</Button>
                                        </BlockStack>
                                    )}

                                    {subscription?.status !== 'active' && (
                                        <Button variant="primary" onClick={() => window.location.href = `/?shop=${shopDomain}`}>
                                            View Plans
                                        </Button>
                                    )}
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>

                    <Layout.Section>
                        <Card padding="0">
                            <Box padding="400">
                                <Text as="h2" variant="headingMd">📜 Billing History</Text>
                            </Box>

                            {charges.length === 0 ? (
                                <Box padding="1000" textAlign="center">
                                    <Text as="p" tone="subdued">No transactions found yet.</Text>
                                </Box>
                            ) : (
                                <IndexTable
                                    resourceName={{ singular: 'charge', plural: 'charges' }}
                                    itemCount={charges.length}
                                    selectable={false}
                                    headings={[
                                        { title: 'Date' },
                                        { title: 'Description' },
                                        { title: 'Type' },
                                        { title: 'Amount' },
                                        { title: 'Status' },
                                    ]}
                                >
                                    {rowMarkup}
                                </IndexTable>
                            )}
                        </Card>
                    </Layout.Section>
                </Layout>
            )}
        </Page>
    );
}
