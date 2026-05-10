/**
 * Prime Pet Food — Dog Profile System
 * Persists dog data to localStorage, powers personalization across the store.
 * 
 * API:
 *   PrimeDogProfile.get()           → returns profile object or null
 *   PrimeDogProfile.save(data)      → saves/updates profile
 *   PrimeDogProfile.clear()         → removes profile
 *   PrimeDogProfile.hasProfile()    → boolean
 *   PrimeDogProfile.getRecommendation() → { size, duration, variant_id }
 *   PrimeDogProfile.getPersonality() → personality type string
 *   PrimeDogProfile.trackSession(data) → logs a chew session
 *   PrimeDogProfile.getSessions()   → array of past sessions
 *   PrimeDogProfile.getReorderTiming() → { daysUntilReorder, lastPurchase }
 *   PrimeDogProfile.onUpdate(fn)    → register callback for profile changes
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'prime_dog_profile';
  var SESSIONS_KEY = 'prime_chew_sessions';
  var PURCHASES_KEY = 'prime_purchases';
  var listeners = [];

  /* ═══════════════════════════════════════
     BREED DATABASE — Duration modifiers
     ═══════════════════════════════════════ */
  var BREED_DATA = {
    'labrador': { modifier: 0.85, size: 'large', personality: 'enthusiastic', chewIntensity: 'power' },
    'golden_retriever': { modifier: 0.9, size: 'large', personality: 'gentle', chewIntensity: 'moderate' },
    'german_shepherd': { modifier: 0.8, size: 'large', personality: 'focused', chewIntensity: 'power' },
    'french_bulldog': { modifier: 1.1, size: 'small', personality: 'playful', chewIntensity: 'moderate' },
    'bulldog': { modifier: 0.95, size: 'medium', personality: 'relaxed', chewIntensity: 'power' },
    'poodle': { modifier: 1.2, size: 'medium', personality: 'intelligent', chewIntensity: 'gentle' },
    'beagle': { modifier: 1.0, size: 'medium', personality: 'curious', chewIntensity: 'moderate' },
    'rottweiler': { modifier: 0.7, size: 'large', personality: 'determined', chewIntensity: 'power' },
    'yorkshire_terrier': { modifier: 1.4, size: 'small', personality: 'feisty', chewIntensity: 'gentle' },
    'boxer': { modifier: 0.85, size: 'large', personality: 'energetic', chewIntensity: 'power' },
    'dachshund': { modifier: 1.2, size: 'small', personality: 'persistent', chewIntensity: 'moderate' },
    'shih_tzu': { modifier: 1.3, size: 'small', personality: 'gentle', chewIntensity: 'gentle' },
    'husky': { modifier: 0.75, size: 'large', personality: 'independent', chewIntensity: 'power' },
    'corgi': { modifier: 1.05, size: 'medium', personality: 'playful', chewIntensity: 'moderate' },
    'great_dane': { modifier: 0.65, size: 'xlarge', personality: 'gentle', chewIntensity: 'power' },
    'chihuahua': { modifier: 1.5, size: 'xsmall', personality: 'feisty', chewIntensity: 'gentle' },
    'pit_bull': { modifier: 0.65, size: 'large', personality: 'determined', chewIntensity: 'power' },
    'australian_shepherd': { modifier: 0.9, size: 'medium', personality: 'intelligent', chewIntensity: 'moderate' },
    'cavalier_king_charles': { modifier: 1.3, size: 'small', personality: 'gentle', chewIntensity: 'gentle' },
    'border_collie': { modifier: 0.95, size: 'medium', personality: 'intelligent', chewIntensity: 'moderate' },
    'doberman': { modifier: 0.75, size: 'large', personality: 'focused', chewIntensity: 'power' },
    'bernese_mountain_dog': { modifier: 0.8, size: 'xlarge', personality: 'gentle', chewIntensity: 'moderate' },
    'pomeranian': { modifier: 1.4, size: 'xsmall', personality: 'playful', chewIntensity: 'gentle' },
    'maltese': { modifier: 1.5, size: 'xsmall', personality: 'gentle', chewIntensity: 'gentle' },
    'cocker_spaniel': { modifier: 1.1, size: 'medium', personality: 'gentle', chewIntensity: 'moderate' },
    'jack_russell': { modifier: 0.9, size: 'small', personality: 'energetic', chewIntensity: 'power' },
    'mixed': { modifier: 1.0, size: 'medium', personality: 'unique', chewIntensity: 'moderate' },
    'other': { modifier: 1.0, size: 'medium', personality: 'unique', chewIntensity: 'moderate' }
  };

  /* ═══════════════════════════════════════
     SIZE → VARIANT MAPPING
     ═══════════════════════════════════════ */
  var SIZE_RECOMMENDATIONS = {
    'xsmall': { size: 'Small (Under 15 lbs)', variantTitle: 'Small' },
    'small': { size: 'Small (15-25 lbs)', variantTitle: 'Small' },
    'medium': { size: 'Medium (25-50 lbs)', variantTitle: 'Medium' },
    'large': { size: 'Large (50-80 lbs)', variantTitle: 'Large' },
    'xlarge': { size: 'Extra Large (80+ lbs)', variantTitle: 'Extra Large' }
  };

  /* ═══════════════════════════════════════
     PERSONALITY SYSTEM
     ═══════════════════════════════════════ */
  var PERSONALITIES = {
    'power_chewer': {
      label: 'Power Chewer',
      emoji: '💪',
      description: 'Your dog is a determined chewer who needs the toughest, longest-lasting options.',
      tips: ['Choose our XL size for maximum duration', 'Try freezing the chew for extra challenge', 'Rotate between 2-3 chews to maintain interest']
    },
    'gentle_gnawer': {
      label: 'Gentle Gnawer',
      emoji: '🐾',
      description: 'Your dog takes their time and savors every chew session.',
      tips: ['Standard sizes work great for your pup', 'One chew can last multiple sessions', 'Great candidate for our subscription plan']
    },
    'anxious_chewer': {
      label: 'Stress Reliever',
      emoji: '🧘',
      description: 'Your dog uses chewing as a calming mechanism — and that\'s healthy!',
      tips: ['Keep a chew available during stressful times', 'Pair with a calming routine before departures', 'Consider our multi-pack for always having one ready']
    },
    'playful_nibbler': {
      label: 'Playful Nibbler',
      emoji: '🎾',
      description: 'Your dog alternates between chewing and playing — short bursts of focused gnawing.',
      tips: ['Smaller sizes are perfect for play-chew-play cycles', 'The puff treat makes a great quick reward', 'Try using the chew as a post-walk wind-down']
    },
    'focused_worker': {
      label: 'Focused Worker',
      emoji: '🎯',
      description: 'When your dog chews, they\'re ALL in. Intense focus until the job is done.',
      tips: ['Our large sizes provide the longest engagement', 'Use chew time as your productive work window', 'Track sessions to optimize your routine']
    }
  };

  /* ═══════════════════════════════════════
     CORE PROFILE METHODS
     ═══════════════════════════════════════ */
  function getProfile() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveProfile(data) {
    try {
      var existing = getProfile() || {};
      var updated = Object.assign({}, existing, data, {
        updatedAt: new Date().toISOString()
      });

      // Auto-calculate derived fields
      if (updated.breed && BREED_DATA[updated.breed]) {
        var breedInfo = BREED_DATA[updated.breed];
        updated.breedData = breedInfo;
        if (!updated.recommendedSize) {
          updated.recommendedSize = breedInfo.size;
        }
      }

      // Calculate personality if we have enough data
      if (updated.chewStyle && updated.breed) {
        updated.personality = calculatePersonality(updated);
      }

      // Set creation date if new
      if (!updated.createdAt) {
        updated.createdAt = new Date().toISOString();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyListeners(updated);
      return updated;
    } catch (e) {
      console.warn('PrimeDogProfile: Could not save profile', e);
      return null;
    }
  }

  function clearProfile() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSIONS_KEY);
      localStorage.removeItem(PURCHASES_KEY);
      notifyListeners(null);
    } catch (e) {}
  }

  function hasProfile() {
    return getProfile() !== null;
  }

  /* ═══════════════════════════════════════
     PERSONALITY CALCULATION
     ═══════════════════════════════════════ */
  function calculatePersonality(profile) {
    var chewStyle = profile.chewStyle || 'moderate';
    var breedData = profile.breedData || {};
    var age = profile.age || 'adult';

    // Determine personality based on chew style + breed traits
    if (chewStyle === 'destroyer' || breedData.chewIntensity === 'power') {
      if (age === 'puppy') return 'playful_nibbler';
      return 'power_chewer';
    }

    if (chewStyle === 'gentle' || breedData.chewIntensity === 'gentle') {
      return 'gentle_gnawer';
    }

    if (profile.chewReason === 'anxiety' || profile.chewReason === 'separation') {
      return 'anxious_chewer';
    }

    if (breedData.personality === 'intelligent' || breedData.personality === 'focused') {
      return 'focused_worker';
    }

    if (breedData.personality === 'playful' || breedData.personality === 'energetic') {
      return 'playful_nibbler';
    }

    return 'gentle_gnawer';
  }

  /* ═══════════════════════════════════════
     RECOMMENDATION ENGINE
     ═══════════════════════════════════════ */
  function getRecommendation() {
    var profile = getProfile();
    if (!profile) return null;

    var breed = profile.breed || 'mixed';
    var weight = profile.weight || 30;
    var chewStyle = profile.chewStyle || 'moderate';
    var age = profile.age || 'adult';

    var breedData = BREED_DATA[breed] || BREED_DATA['mixed'];

    // Calculate duration estimate
    var baseDuration = 60; // minutes
    var duration = baseDuration * breedData.modifier;

    // Weight adjustments
    if (weight < 15) duration *= 1.4;
    else if (weight < 25) duration *= 1.2;
    else if (weight < 50) duration *= 1.0;
    else if (weight < 80) duration *= 0.85;
    else duration *= 0.7;

    // Chew style adjustments
    if (chewStyle === 'destroyer') duration *= 0.6;
    else if (chewStyle === 'gentle') duration *= 1.4;

    // Age adjustments
    if (age === 'puppy') duration *= 1.3;
    else if (age === 'senior') duration *= 1.2;

    duration = Math.round(duration);

    // Determine recommended size
    var size = 'medium';
    if (weight < 15) size = 'xsmall';
    else if (weight < 25) size = 'small';
    else if (weight < 50) size = 'medium';
    else if (weight < 80) size = 'large';
    else size = 'xlarge';

    var sizeInfo = SIZE_RECOMMENDATIONS[size];

    return {
      duration: duration,
      durationRange: Math.round(duration * 0.75) + '-' + Math.round(duration * 1.25) + ' minutes',
      size: sizeInfo.size,
      variantTitle: sizeInfo.variantTitle,
      personality: profile.personality || calculatePersonality(profile),
      breed: breed,
      confidence: profile.breed !== 'other' ? 'high' : 'moderate'
    };
  }

  /* ═══════════════════════════════════════
     CHEW SESSION TRACKING
     ═══════════════════════════════════════ */
  function trackSession(data) {
    try {
      var sessions = getSessions();
      sessions.push(Object.assign({}, data, {
        id: Date.now().toString(36),
        date: new Date().toISOString()
      }));

      // Keep last 50 sessions
      if (sessions.length > 50) {
        sessions = sessions.slice(-50);
      }

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return sessions;
    } catch (e) {
      return [];
    }
  }

  function getSessions() {
    try {
      var data = localStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function getSessionStats() {
    var sessions = getSessions();
    if (sessions.length === 0) return null;

    var totalDuration = 0;
    var count = sessions.length;

    sessions.forEach(function(s) {
      totalDuration += (s.duration || 0);
    });

    return {
      totalSessions: count,
      averageDuration: Math.round(totalDuration / count),
      totalMinutes: totalDuration,
      lastSession: sessions[sessions.length - 1],
      streak: calculateStreak(sessions)
    };
  }

  function calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    var streak = 1;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var lastDate = new Date(sessions[sessions.length - 1].date);
    lastDate.setHours(0, 0, 0, 0);

    // If last session wasn't today or yesterday, streak is 0
    var diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;

    for (var i = sessions.length - 2; i >= 0; i--) {
      var current = new Date(sessions[i].date);
      current.setHours(0, 0, 0, 0);
      var prev = new Date(sessions[i + 1].date);
      prev.setHours(0, 0, 0, 0);

      var gap = Math.floor((prev - current) / (1000 * 60 * 60 * 24));
      if (gap <= 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /* ═══════════════════════════════════════
     PURCHASE & REORDER TRACKING
     ═══════════════════════════════════════ */
  function trackPurchase(data) {
    try {
      var purchases = getPurchases();
      purchases.push(Object.assign({}, data, {
        date: new Date().toISOString()
      }));
      localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
      return purchases;
    } catch (e) {
      return [];
    }
  }

  function getPurchases() {
    try {
      var data = localStorage.getItem(PURCHASES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function getReorderTiming() {
    var purchases = getPurchases();
    var sessions = getSessions();
    var profile = getProfile();

    if (purchases.length === 0) {
      return { daysUntilReorder: null, lastPurchase: null, suggestion: 'Make your first purchase to start tracking!' };
    }

    var lastPurchase = purchases[purchases.length - 1];
    var daysSincePurchase = Math.floor((Date.now() - new Date(lastPurchase.date).getTime()) / (1000 * 60 * 60 * 24));

    // Estimate consumption rate
    var avgSessionsPerWeek = 5; // default
    var avgDurationPerSession = 60; // minutes default

    if (sessions.length >= 3) {
      var recentSessions = sessions.slice(-7);
      var timeSpan = (new Date(recentSessions[recentSessions.length - 1].date) - new Date(recentSessions[0].date)) / (1000 * 60 * 60 * 24);
      if (timeSpan > 0) {
        avgSessionsPerWeek = Math.round((recentSessions.length / timeSpan) * 7);
      }
      avgDurationPerSession = recentSessions.reduce(function(sum, s) { return sum + (s.duration || 60); }, 0) / recentSessions.length;
    }

    // A typical chew lasts ~10 hours of total chew time before consumed
    var totalChewHours = 10;
    var minutesPerWeek = avgSessionsPerWeek * avgDurationPerSession;
    var weeksPerChew = (totalChewHours * 60) / minutesPerWeek;
    var quantity = lastPurchase.quantity || 1;
    var totalWeeks = weeksPerChew * quantity;
    var daysUntilReorder = Math.round(totalWeeks * 7) - daysSincePurchase;

    var suggestion;
    if (daysUntilReorder <= 0) {
      suggestion = 'Time to reorder! Your supply may be running low.';
    } else if (daysUntilReorder <= 7) {
      suggestion = 'Running low soon — reorder this week for uninterrupted enrichment.';
    } else {
      suggestion = 'You\'re set for about ' + daysUntilReorder + ' more days.';
    }

    return {
      daysUntilReorder: Math.max(0, daysUntilReorder),
      daysSincePurchase: daysSincePurchase,
      lastPurchase: lastPurchase,
      suggestion: suggestion,
      avgSessionsPerWeek: avgSessionsPerWeek
    };
  }

  /* ═══════════════════════════════════════
     ENRICHMENT RECOMMENDATIONS
     ═══════════════════════════════════════ */
  function getEnrichmentTips() {
    var profile = getProfile();
    var sessions = getSessions();
    var personality = profile ? profile.personality : null;

    var tips = [];

    // Personality-based tips
    if (personality && PERSONALITIES[personality]) {
      tips = tips.concat(PERSONALITIES[personality].tips);
    }

    // Session-based tips
    var stats = getSessionStats();
    if (stats) {
      if (stats.averageDuration < 30) {
        tips.push('Try a larger size for longer engagement');
        tips.push('Freeze the chew to slow down power chewers');
      }
      if (stats.streak >= 7) {
        tips.push('Amazing ' + stats.streak + '-day streak! Consistency builds calm habits.');
      }
      if (stats.totalSessions >= 10) {
        tips.push('Your dog has completed ' + stats.totalSessions + ' enrichment sessions!');
      }
    }

    return tips.slice(0, 5);
  }

  /* ═══════════════════════════════════════
     BREED-SPECIFIC MESSAGING
     ═══════════════════════════════════════ */
  function getBreedMessage() {
    var profile = getProfile();
    if (!profile || !profile.breed) return null;

    var breed = profile.breed;
    var breedData = BREED_DATA[breed];
    if (!breedData) return null;

    var dogName = profile.dogName || 'your dog';
    var breedLabel = breed.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });

    var messages = {
      power: {
        headline: dogName + ' is a power chewer',
        subtext: breedLabel + 's are known for their strong jaws. Our XL chews are built to last.',
        badge: 'Power Chewer Approved'
      },
      moderate: {
        headline: 'Perfect for ' + dogName,
        subtext: breedLabel + 's typically enjoy 45-90 minutes of focused chewing per session.',
        badge: 'Breed-Matched'
      },
      gentle: {
        headline: dogName + ' will love this',
        subtext: breedLabel + 's are gentle chewers — one chew can last multiple sessions!',
        badge: 'Long-Lasting Choice'
      }
    };

    return messages[breedData.chewIntensity] || messages.moderate;
  }

  /* ═══════════════════════════════════════
     EVENT SYSTEM
     ═══════════════════════════════════════ */
  function onUpdate(fn) {
    if (typeof fn === 'function') {
      listeners.push(fn);
    }
  }

  function notifyListeners(profile) {
    listeners.forEach(function(fn) {
      try { fn(profile); } catch (e) {}
    });

    // Also dispatch a custom event for other scripts
    try {
      window.dispatchEvent(new CustomEvent('prime:profile:updated', { detail: profile }));
    } catch (e) {}
  }

  /* ═══════════════════════════════════════
     INTEGRATION: Auto-save from analyzer
     ═══════════════════════════════════════ */
  function initAnalyzerIntegration() {
    // Listen for analyzer completion events
    window.addEventListener('prime:analyzer:complete', function(e) {
      if (e.detail) {
        saveProfile({
          breed: e.detail.breed,
          weight: e.detail.weight,
          chewStyle: e.detail.chewStyle,
          age: e.detail.age,
          dogName: e.detail.dogName || null,
          source: 'analyzer'
        });
      }
    });
  }

  /* ═══════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════ */
  window.PrimeDogProfile = {
    get: getProfile,
    save: saveProfile,
    clear: clearProfile,
    hasProfile: hasProfile,
    getRecommendation: getRecommendation,
    getPersonality: function() {
      var profile = getProfile();
      if (!profile || !profile.personality) return null;
      return PERSONALITIES[profile.personality] || null;
    },
    getPersonalityType: function() {
      var profile = getProfile();
      return profile ? profile.personality : null;
    },
    trackSession: trackSession,
    getSessions: getSessions,
    getSessionStats: getSessionStats,
    trackPurchase: trackPurchase,
    getPurchases: getPurchases,
    getReorderTiming: getReorderTiming,
    getEnrichmentTips: getEnrichmentTips,
    getBreedMessage: getBreedMessage,
    getBreedData: function(breed) { return BREED_DATA[breed] || null; },
    getAllBreeds: function() { return Object.keys(BREED_DATA); },
    onUpdate: onUpdate,
    PERSONALITIES: PERSONALITIES,
    VERSION: '1.0.0'
  };

  // Initialize integrations
  initAnalyzerIntegration();

  // Dispatch ready event
  try {
    window.dispatchEvent(new CustomEvent('prime:profile:ready'));
  } catch (e) {}

})();
