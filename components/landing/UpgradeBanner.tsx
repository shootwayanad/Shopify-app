'use client';

import { useState } from 'react';
import { InlineStack, Text, Button, Box } from '@shopify/polaris';

export function UpgradeBanner() {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <Box
            background="bg-surface-secondary"
            padding="300"
            borderBlockEndWidth="025"
            borderColor="border"
        >
            <InlineStack align="space-between" blockAlign="center" gap="400">
                <InlineStack gap="400" blockAlign="center" wrap={false}>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                        Upgrade to Section Store Plus+ 💎 $10/month
                    </Text>
                    <InlineStack gap="300" wrap={false}>
                        <Text as="span" variant="bodySm" tone="subdued">
                            ✓ Unlimited blocks
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                            ✓ Priority technical support
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                            ✓ Access to all premium sections automatically for Plus
                        </Text>
                    </InlineStack>
                </InlineStack>

                <InlineStack gap="200" wrap={false}>
                    <Button variant="primary" tone="success">
                        Try Plan - 14 days Free
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() => setVisible(false)}
                        accessibilityLabel="Dismiss banner"
                    >
                        ✕
                    </Button>
                </InlineStack>
            </InlineStack>
        </Box>
    );
}
