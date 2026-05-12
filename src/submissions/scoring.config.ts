export const scoringConfig = {
  // 1. AWARENESS
  awareness_1: { category: 'Awareness', reverse: false },
  awareness_2: { category: 'Awareness', reverse: false },
  awareness_3: { category: 'Awareness', reverse: false },
  awareness_4: { category: 'Awareness', reverse: false },
  awareness_5: { category: 'Awareness', reverse: false },
  // 2. ATTITUDES / MOTIVATIONS
  attitude_1: { category: 'Attitude', reverse: false },
  attitude_2: { category: 'Attitude', reverse: false },
  attitude_3: { category: 'Attitude', reverse: false },
  attitude_4: { category: 'Attitude', reverse: false },
  // 3. HABITS - TRAVEL
  habits_travel_daily: {
    category: 'Habits',
    isMatrix: true,
    reverseKeys: ['Car (alone)'], // Samo vožnja kolima skida poene
  },
  habits_travel_distance: {
    category: 'Habits',
    valueMap: {
      'Less than 2km': 5,
      '2-5km': 4,
      '5-10km': 3,
      '10-20km': 2,
      'More than 20km': 1,
    },
  },
  habits_other_plane: {
    category: 'Habits',
    isMatrix: true,
    reverseKeys: ['Plane'],
  },
  habits_trips_total: {
    category: 'Habits',
    valueMap: {
      '0': 5,
      '1-2': 4,
      '3-5': 3,
      '6-10': 2,
      'More than 10': 1,
    },
  },
  habits_trips_plane: {
    category: 'Habits',
    valueMap: {
      '0': 5,
      '1': 4,
      '2': 3,
      '3-5': 2,
      'More than 5': 1,
    },
  },
  // 4. HABITS - LIVING AND ACCOMMODATION
  habits_living_heating: {
    category: 'Habits',
    valueMap: {
      'Paid separately': 5,
      'Not sure': 3,
      'Included in rent/dorm': 1,
    },
  },
  habits_living_laundry: {
    category: 'Habits',
    valueMap: {
      '0': 5,
      '1': 4,
      '2-3': 3,
      '4-5': 2,
      'More than 5': 1,
    },
  },
  habits_sustainability: {
    category: 'Habits',
    isMatrix: true,
    reverseKeys: [],
  },
  // 5. HABITS - BUYING AND CONSUMPTION
  habits_consumption_diet: {
    category: 'Habits',
    valueMap: {
      Vegan: 5,
      Vegetarian: 4,
      Pescatarian: 3,
      'Based on a mix of meat and vegetables': 2,
      'Based mostly on meat': 1,
    },
  },
  habits_consumption_meat_days: {
    category: 'Habits',
    valueMap: {
      Never: 5,
      '1-2': 4,
      '3-4': 3,
      '5-6': 2,
      '7': 1,
    },
  },
  habits_consumption_restaurants: { category: 'Habits', reverse: false },
  habits_consumption_leftovers: { category: 'Habits', reverse: false },
  habits_consumption_markets: { category: 'Habits', reverse: false },
  habits_consumption_seasonal: { category: 'Habits', reverse: false },
  habits_consumption_bags: { category: 'Habits', reverse: false },
  habits_consumption_bottle: { category: 'Habits', reverse: false },
  habits_consumption_secondhand: { category: 'Habits', reverse: false },
  habits_consumption_new_clothes: {
    category: 'Habits',
    valueMap: {
      '0': 5,
      '1-2': 4,
      '3-5': 3,
      '6-10': 2,
      'More than 10': 1,
    },
  },
  // 6. HABITS - DIGITAL HABITS
  habits_digital_devices: { category: 'Habits', reverse: false },
  habits_digital_energy_saving: { category: 'Habits', reverse: false },
  habits_digital_files: { category: 'Habits', reverse: false },
  habits_digital_tradein: { category: 'Habits', reverse: false },
  habits_digital_ewaste: { category: 'Habits', reverse: false },
  // 7. HABITS - COMMUNITY
  habits_community_activities: { category: 'Habits', reverse: false },
  // 8. BARRIERS
  // Sve obrćemo:
  barriers_structural_products: { category: 'Barriers', reverse: true },
  barriers_structural_mobility: { category: 'Barriers', reverse: true },
  barriers_financial_expensive: { category: 'Barriers', reverse: true },
  barriers_informational_confusing: { category: 'Barriers', reverse: true },
  barriers_informational_uninformed: { category: 'Barriers', reverse: true },
  barriers_personal_convenience: { category: 'Barriers', reverse: true },
  barriers_personal_support: { category: 'Barriers', reverse: true },
  barriers_personal_habits: { category: 'Barriers', reverse: true },
  // 9. MOBILITY RUBRICS
  mobility_before_rubric: { category: 'Mobility', isRubric: true },
  mobility_during_rubric: { category: 'Mobility', isRubric: true },
  mobility_after_rubric: { category: 'Mobility', isRubric: true },
};
