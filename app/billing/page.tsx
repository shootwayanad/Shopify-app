'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] p-4 text-center">
                <div className="glass-card p-8 max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Shop Not Found</h2>
                    <p className="text-[hsl(var(--color-text-muted))]">Please access this page from your Shopify admin panel.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--color-bg))]">
            <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]/50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-[family-name:var(--font-playfair)]">
                            <span className="gradient-text">Billing & Subscriptions</span>
                        </h1>
                        <p className="text-[hsl(var(--color-text-muted))] mt-1">Manage your payment history and plans</p>
                    </div>
                    <button
                        onClick={() => window.location.href = `/?shop=${shopDomain}`}
                        className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-lg hover:bg-white/5 transition-colors"
                    >
                        ← Back to Gallery
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="inline-block animate-spin text-6xl mb-4">⚙️</div>
                        <p className="text-[hsl(var(--color-text-muted))]">Loading your billing details...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Subscription Status */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-6 border-t-4 border-[hsl(var(--color-primary))]"
                            >
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span>🛡️</span> Current Plan
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-[hsl(var(--color-text-muted))]">Plan Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-2xl font-bold ${subscription?.status === 'active' ? 'text-green-500' : 'text-gray-400'}`}>
                                                {subscription?.status === 'active' ? 'Active' : 'No Active Subscription'}
                                            </span>
                                            {subscription?.status === 'active' && (
                                                <span className="animate-pulse h-2 w-2 rounded-full bg-green-500"></span>
                                            )}
                                        </div>
                                    </div>

                                    {subscription?.status === 'active' && (
                                        <>
                                            <div>
                                                <p className="text-sm text-[hsl(var(--color-text-muted))]">Current Plan</p>
                                                <p className="text-lg font-semibold">{subscription.plan}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-[hsl(var(--color-text-muted))]">Next Billing Date</p>
                                                <p className="text-lg font-semibold">
                                                    {new Date(subscription.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button className="w-full py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                                                Cancel Subscription
                                            </button>
                                        </>
                                    )}

                                    {subscription?.status !== 'active' && (
                                        <button
                                            onClick={() => window.location.href = `/?shop=${shopDomain}`}
                                            className="btn-primary w-full"
                                        >
                                            View Plans
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Charges */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-6"
                            >
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span>📜</span> Billing History
                                </h2>

                                {charges.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl">
                                        <p className="text-[hsl(var(--color-text-muted))]">No transitions found yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-sm text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">
                                                <tr>
                                                    <th className="pb-4 font-medium">Date</th>
                                                    <th className="pb-4 font-medium">Description</th>
                                                    <th className="pb-4 font-medium">Type</th>
                                                    <th className="pb-4 font-medium">Amount</th>
                                                    <th className="pb-4 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm divide-y divide-[hsl(var(--color-border))]">
                                                {charges.map((charge) => (
                                                    <tr key={charge.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="py-4 whitespace-nowrap">
                                                            {new Date(charge.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 font-medium">
                                                            {charge.charge_type === 'subscription' ? 'Plan Subscription' : `Section: ${charge.section_name || 'Premium'}`}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-bold">
                                                                {charge.charge_type}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 font-bold text-[hsl(var(--color-primary))]">
                                                            ${charge.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${charge.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                                {charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
