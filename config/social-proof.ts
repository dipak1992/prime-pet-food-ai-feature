import { marketingStats } from '@/lib/marketing/stats'

export const socialProof = {
  householdCount: marketingStats.householdCount,
  dinnersPlanned: marketingStats.dinnersPlanned,
  rating: marketingStats.rating,
  hoursSavedPerWeek: marketingStats.hoursSavedPerWeek,

  avatars: [
    { src: '/avatars/1.jpg', alt: 'Marissa' },
    { src: '/avatars/2.jpg', alt: 'Dev' },
    { src: '/avatars/3.jpg', alt: 'Priya' },
    { src: '/avatars/4.jpg', alt: 'James' },
    { src: '/avatars/5.jpg', alt: 'Elena' },
  ],

  testimonials: [
    {
      name: 'Marissa K.',
      city: 'Austin, TX',
      photo: '/testimonials/marissa.jpg',
      quote: 'MealEase made the weekly dinner conversation easier to start.',
    },
    {
      name: 'Dev P.',
      city: 'Brooklyn, NY',
      photo: '/testimonials/dev.jpg',
      quote: 'The leftovers flow helped us use what was already in the fridge.',
    },
    {
      name: 'Priya S.',
      city: 'Toronto, ON',
      photo: '/testimonials/priya.jpg',
      quote: 'The week plan plus grocery list is the part I would come back for.',
    },
    {
      name: 'James R.',
      city: 'Denver, CO',
      photo: '/testimonials/james.jpg',
      quote: 'The fridge scan made it easier to pick dinner without starting from scratch.',
    },
    {
      name: 'Elena M.',
      city: 'San Diego, CA',
      photo: '/testimonials/elena.jpg',
      quote: "The household preferences are what make it feel different from a chat prompt.",
    },
  ],
}
