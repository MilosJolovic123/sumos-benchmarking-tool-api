export const scoringConfig = {
  awareness_1: { category: 'Awareness', reverse: false },
  awareness_2: { category: 'Awareness', reverse: false },
  awareness_3: { category: 'Awareness', reverse: false },
  awareness_4: { category: 'Awareness', reverse: false },
  awareness_5: { category: 'Awareness', reverse: false },

  attitude_1: { category: 'Attitudes', reverse: false },
  attitude_2: { category: 'Attitudes', reverse: false },
  attitude_3: { category: 'Attitudes', reverse: false },
  attitude_4: { category: 'Attitudes', reverse: false },

  habits_travel_daily: {
    category: 'Travel',
    isMatrix: true,
    reverseKeys: ['Car (alone)', 'Car alone'], // Dodate obe varijacije zbog sigurnosti [cite: 41]
  },
  habits_travel_distance: {
    category: 'Travel',
    valueMap: {
      'Less than 2km': 5,
      '2-5km': 4,
      '5-10km': 3,
      '10-20km': 2,
      'More than 20km': 1,
    },
  },
  habits_other_plane: {
    category: 'Travel',
    isMatrix: true,
    reverseKeys: ['Plane', 'Car (alone)', 'Car alone'], // [cite: 52, 53]
  },
  habits_trips_total: {
    category: 'Travel',
    valueMap: {
      '0': 5,
      '1-2': 4,
      '3-5': 3,
      '6-10': 2,
      'More than 10': 1,
    },
  },
  habits_trips_plane: {
    category: 'Travel',
    valueMap: {
      '0': 5,
      '1': 4,
      '2': 3,
      '3-5': 2,
      'More than 5': 1,
    },
  },

  habits_living_heating: {
    category: 'Living',
    excludeFromEcoScore: true, // Dokument kaze: OVO NE ULAZI U ECOSCORE [cite: 74]
    valueMap: {
      'Paid separately': 5,
      'Not sure': 3,
      'Included in rent/dorm': 1,
    },
  },
  habits_living_laundry: {
    category: 'Living',
    valueMap: {
      '0': 5,
      '1': 4,
      '2-3': 3,
      '4-5': 2,
      'More than 5': 1,
    },
  },
  habits_sustainability: {
    category: 'Living',
    isMatrix: true,
    reverseKeys: [],
  },

  habits_consumption_diet: {
    category: 'Consumption',
    valueMap: {
      Vegan: 5,
      Vegetarian: 4,
      Pescatarian: 3,
      'Both meat and vegetables': 2,
      'Based on a mix of meat and vegetables': 2,
      'Based mostly on meat': 1,
    },
  },
  habits_consumption_meat_days: {
    category: 'Consumption',
    valueMap: {
      Never: 5,
      '1-2': 4,
      '3-4': 3,
      '5-6': 2,
      '7': 1,
    },
  },
  habits_consumption_restaurants: { category: 'Consumption', reverse: false },
  habits_consumption_leftovers: { category: 'Consumption', reverse: false },
  habits_consumption_markets: { category: 'Consumption', reverse: false },
  habits_consumption_seasonal: { category: 'Consumption', reverse: false },
  habits_consumption_bags: { category: 'Consumption', reverse: false },
  habits_consumption_bottle: { category: 'Consumption', reverse: false },
  habits_consumption_secondhand: { category: 'Consumption', reverse: false },
  habits_consumption_new_clothes: {
    category: 'Consumption',
    valueMap: {
      '0': 5,
      '1-2': 4,
      '3-5': 3,
      '6-10': 2,
      'More than 10': 1,
    },
  },

  habits_digital_devices: { category: 'Digital', reverse: false },
  habits_digital_energy_saving: { category: 'Digital', reverse: false },
  habits_digital_files: { category: 'Digital', reverse: false },
  habits_digital_tradein: { category: 'Digital', reverse: false },
  habits_digital_ewaste: { category: 'Digital', reverse: false },

  habits_community_activities: { category: 'Engagement', reverse: false },

  barriers_structural_products: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_structural_mobility: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_financial_expensive: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_informational_confusing: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_informational_uninformed: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_personal_convenience: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_personal_support: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },
  barriers_personal_habits: {
    category: 'Barriers',
    reverse: true,
    excludeFromEcoScore: true,
  },

  mobility_before_rubric: {
    category: 'Mobility_Pre',
    isMatrix: true,
    excludeFromEcoScore: true,
  },
  mobility_during_rubric: {
    category: 'Mobility_During',
    isMatrix: true,
    excludeFromEcoScore: true,
  },
  mobility_after_rubric: {
    category: 'Mobility_After',
    isMatrix: true,
    excludeFromEcoScore: true,
  },
};
