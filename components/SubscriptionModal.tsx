'use client';

import { useState, useEffect } from 'react';
import {
    Modal,
    Card,
    Layout,
    Text,
    Box,
    BlockStack,
    InlineStack,
    Button,
    List,
    Spinner
} from '@shopify/polaris';

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
}

export default function SubscriptionModal({
    shopDomain,
    onCloseAction
}: {
    shopDomain: string;
    onCloseAction: () => void;
}) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    async function fetchPlans() {
        try {
            const res = await fetch('/api/billing/plans');
            const data = await res.json();
            setPlans(data.plans || []);
        } catch (error) {
            console.error('Failed to fetch plans');
        } finally {
            setFetching(false);
        }
    }

    async function handleSubscribe(planId: string) {
        setLoading(true);
        try {
            const res = await fetch('/api/billing/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopDomain, planId })
            });

            const data = await res.json();
            if (data.confirmationUrl) {
                window.top!.location.href = data.confirmationUrl;
            }
        } catch (error) {
            alert('Failed to start subscription');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={true}
            onClose={onCloseAction}
            title="Choose Your Plan"
            size="large"
        >
            <Modal.Section>
                {fetching ? (
                    <Box padding="1000">
                        <InlineStack align="center">
                            <Spinner size="large" />
                        </InlineStack>
                    </Box>
                ) : (
                    <Layout>
                        {plans.map(plan => (
                            <Layout.Section variant="oneHalf" key={plan.id}>
                                <Card>
                                    <Box padding="400">
                                        <BlockStack gap="400">
                                            <BlockStack gap="100">
                                                <Text as="h3" variant="headingLg">{plan.name}</Text>
                                                <InlineStack gap="200" blockAlign="baseline">
                                                    <Text as="span" variant="heading2xl" fontWeight="bold">${plan.price}</Text>
                                                    <Text as="span" variant="bodyMd" tone="subdued">/{plan.interval === 'EVERY_30_DAYS' ? 'month' : 'year'}</Text>
                                                </InlineStack>
                                            </BlockStack>

                                            <Box minHeight="120px">
                                                <List type="bullet">
                                                    {plan.features.map((feature, i) => (
                                                        <List.Item key={i}>{feature}</List.Item>
                                                    ))}
                                                </List>
                                            </Box>

                                            <Button
                                                variant="primary"
                                                fullWidth
                                                loading={loading}
                                                onClick={() => handleSubscribe(plan.id)}
                                            >
                                                Subscribe
                                            </Button>
                                        </BlockStack>
                                    </Box>
                                </Card>
                            </Layout.Section>
                        ))}
                    </Layout>
                )}
            </Modal.Section>
        </Modal>
    );
}
