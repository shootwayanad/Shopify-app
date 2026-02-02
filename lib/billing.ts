import axios from 'axios';

export interface SubscriptionPlan {
    name: string;
    price: number;
    interval: 'EVERY_30_DAYS' | 'ANNUAL';
    trialDays?: number;
}

export interface OneTimeCharge {
    name: string;
    price: number;
    returnUrl: string;
}

/**
 * Create a recurring application charge (subscription)
 */
export async function createSubscription(
    shop: string,
    accessToken: string,
    plan: SubscriptionPlan
) {
    const mutation = `
        mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int) {
            appSubscriptionCreate(
                name: $name
                lineItems: $lineItems
                returnUrl: $returnUrl
                trialDays: $trialDays
                test: true
            ) {
                appSubscription {
                    id
                    status
                }
                confirmationUrl
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const variables = {
        name: plan.name,
        returnUrl: `${process.env.SHOPIFY_APP_URL}/api/billing/callback`,
        trialDays: plan.trialDays || 0,
        lineItems: [{
            plan: {
                appRecurringPricingDetails: {
                    price: { amount: plan.price, currencyCode: 'USD' },
                    interval: plan.interval
                }
            }
        }]
    };

    const response = await axios.post(
        `https://${shop}/admin/api/2024-01/graphql.json`,
        { query: mutation, variables },
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.data.appSubscriptionCreate;
}

/**
 * Create a one-time application charge
 */
export async function createOneTimeCharge(
    shop: string,
    accessToken: string,
    charge: OneTimeCharge
) {
    const mutation = `
        mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
            appPurchaseOneTimeCreate(
                name: $name
                price: $price
                returnUrl: $returnUrl
                test: true
            ) {
                appPurchaseOneTime {
                    id
                    status
                }
                confirmationUrl
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const variables = {
        name: charge.name,
        price: { amount: charge.price, currencyCode: 'USD' },
        returnUrl: charge.returnUrl
    };

    const response = await axios.post(
        `https://${shop}/admin/api/2024-01/graphql.json`,
        { query: mutation, variables },
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.data.appPurchaseOneTimeCreate;
}

/**
 * Check if merchant has active subscription
 */
export async function hasActiveSubscription(
    shop: string,
    accessToken: string
): Promise<boolean> {
    const query = `
        {
            currentAppInstallation {
                activeSubscriptions {
                    id
                    status
                }
            }
        }
    `;

    const response = await axios.post(
        `https://${shop}/admin/api/2024-01/graphql.json`,
        { query },
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        }
    );

    const subscriptions = response.data.data.currentAppInstallation.activeSubscriptions;
    return subscriptions && subscriptions.length > 0;
}
