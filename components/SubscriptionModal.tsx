'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

    useEffect(() => {
        fetchPlans();
    }, []);

    async function fetchPlans() {
        const res = await fetch('/api/billing/plans');
        const data = await res.json();
        setPlans(data.plans || []);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card max-w-4xl w-full p-8 bg-[hsl(var(--color-surface))]"
            >
                <h2 className="text-3xl font-bold gradient-text mb-6">Choose Your Plan</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="glass-card p-6 border-2 border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))] transition-all">
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="text-4xl font-bold gradient-text mb-4">
                                ${plan.price}
                                <span className="text-sm text-[hsl(var(--color-text-muted))]">/{plan.interval}</span>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-[hsl(var(--color-primary))]">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? 'Processing...' : 'Subscribe'}
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onCloseAction}
                    className="mt-6 text-[hsl(var(--color-text-muted))] hover:text-white"
                >
                    Close
                </button>
            </motion.div>
        </div>
    );
}
