export const pillars = [
  {
    id: 'tonight',
    icon: '🍽️',
    image: '/landing/optimized/tonight-card.webp',
    question: "What's for dinner?",
    title: 'Tonight Suggestions',
    answer:
      'Open the app. See tonight\'s dinner tailored to your household. Cook in under 30 minutes.',
    badge: null,
  },
  {
    id: 'snap',
    icon: '📸',
    image: '/landing/optimized/snap-card.webp',
    question: "What's in my fridge?",
    title: 'Snap & Cook',
    answer:
      "Point your camera at your fridge. We'll identify ingredients and suggest 3 recipes you can make right now.",
    badge: null,
  },
  {
    id: 'autopilot',
    icon: '📅',
    image: '/landing/optimized/weekly-card.webp',
    question: "What's this week?",
    title: 'Weekly Autopilot',
    answer:
      'One tap, seven dinners planned. Based on your household, preferences, and budget.',
    badge: null,
  },
  {
    id: 'leftovers',
    icon: '🍱',
    image: '/landing/optimized/leftover-card.webp',
    question: 'What do I do with leftovers?',
    title: 'Leftovers AI',
    answer:
      "Cooked chicken last night? We'll turn it into tacos, stir-fry, or a lunch salad — automatically.",
    badge: 'NEW',
  },
  {
    id: 'budget',
    icon: '💰',
    image: '/landing/optimized/budget-card.webp',
    question: 'What will it cost me?',
    title: 'Budget Intelligence',
    answer:
      "See your week's estimated grocery total before you shop. Set a budget and swap before checkout.",
    badge: 'NEW',
  },
  {
    id: 'grocery',
    icon: '🛒',
    image: '/landing/optimized/grocery-card.webp',
    question: 'How do I buy everything?',
    title: 'Smart Grocery List',
    answer:
      'Turn your weekly plan into a ready-to-shop grocery list with supported store handoff, copy, PDF, and local-store export.',
    badge: 'NEW',
  },
] as const
