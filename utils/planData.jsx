/**
 * PrepSmart AI 2.0 - Pricing & Plan Data
 * Multi-tier career acceleration packages with monthly and annual billing rates.
 */

export const PLAN_TIERS = [
  {
    id: 'starter',
    name: 'Starter Community',
    tagline: 'Essential AI interview practice for exploring candidates.',
    monthlyCost: 0,
    annualCost: 0,
    popular: false,
    badgeText: 'Free Forever',
    ctaText: 'Current Plan',
    paymentLink: null,
    features: [
      { text: '3 Full AI Mock Interview Rounds', included: true },
      { text: 'Ollama Llama 3.3 Core Evaluation', included: true },
      { text: 'Community Question Bank (150+ Qs)', included: true },
      { text: 'Real-Time Spoken Audio Transcription', included: true },
      { text: 'Unlimited Interview Retakes', included: true },
      { text: '16-Band Real-Time Audio Visualizer', included: false },
      { text: 'On-Demand Ollama AI Question Synthesis', included: false },
      { text: 'FAANG Staff Engineer Rubrics & Scoring', included: false },
      { text: 'Exportable PDF Performance Reports', included: false },
      { text: 'Persona Stress & Speed Calibration', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Candidate',
    tagline: 'Our flagship accelerator for active job seekers targeting tier-1 tech.',
    monthlyCost: 14,
    annualCost: 11,
    popular: true,
    badgeText: 'Most Popular',
    ctaText: 'Upgrade to Pro',
    paymentLink: 'https://buy.stripe.com/test_28o9EjbkvgfQ8VOeUV',
    features: [
      { text: 'Unlimited AI Mock Interview Rounds', included: true },
      { text: 'Ollama Llama 3.3 Local & Cloud Inference', included: true },
      { text: 'Full Question Bank + On-Demand AI Synthesis', included: true },
      { text: '16-Band Real-Time Audio Spectrum Visualizer', included: true },
      { text: 'FAANG Staff Engineer Rubrics & Feedback', included: true },
      { text: 'Exportable Comprehensive PDF Performance Reports', included: true },
      { text: 'Speech Pace, WPM & Clarity Diagnostics', included: true },
      { text: 'Interactive Persona Calibration Cockpit', included: true },
      { text: 'Cloud Synchronization & 2FA Security', included: true },
      { text: '1-on-1 Resume & Technical Roadmap Review', included: false },
    ],
  },
  {
    id: 'executive',
    name: 'Executive Accelerator',
    tagline: 'Dedicated coaching & company-specific rubrics for Senior & Staff engineers.',
    monthlyCost: 29,
    annualCost: 22,
    popular: false,
    badgeText: 'Senior & Staff',
    ctaText: 'Get Executive Access',
    paymentLink: 'https://buy.stripe.com/test_28o9EjbkvgfQ8VOeUV',
    features: [
      { text: 'Everything Included in Pro Candidate', included: true },
      { text: 'Company-Specific Rubrics (Google, Meta, Netflix)', included: true },
      { text: 'Unlimited Persona Customization & Stress Testing', included: true },
      { text: 'Dedicated System Design & Architecture Rounds', included: true },
      { text: 'Priority Ollama AI Model Queue (Sub-second)', included: true },
      { text: 'Personalized 1-on-1 Career & Resume Roadmap', included: true },
      { text: 'Behavioral STAR Framework Deep Dives', included: true },
      { text: 'Executive Offer Negotiation Playbook', included: true },
      { text: 'Private Slack Channel with Staff Coaches', included: true },
      { text: 'Unlimited Historical Session Storage', included: true },
    ],
  },
];

export default PLAN_TIERS;