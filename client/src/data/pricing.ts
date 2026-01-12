import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 29,
        period: "month",
        features: [
            "50 AI thumbnails/mo",
            "Basic Templates",
            "Standard Resolutions",
            "No Watermark",
            "Email support"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 79,
        period: "month",
        features: [
            "Unlimited AI thumbnails",
            "Premium Templates",
            "4k Resolutions",
            "A/B testing Tools",
            "Priorty support",
            "Custom Fonts",
            "Brand Kit analysis"
        ],
        mostPopular: true
    },
  
];