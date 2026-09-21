/**
 * Vastu — the house, and which way it faces.
 *
 * Vastu is geometry and directions rather than planets, so nothing here is
 * computed from an ephemeris. What it does add is the person's own chart:
 * the direction their lagna lord favours is worth more to them than a
 * generic rule, and a remedy aimed at a graha that is actually weak in the
 * chart is worth more than one aimed at a graha that is fine.
 */
import { GRAHAS, type GrahaId } from './ephemeris';
import { GRAHA_TRAITS } from './lucky';
import type { Chart } from './chart';

export type Direction = {
  id: string;
  name: string;
  np: string;
  /** The direction's ruling deity, as vastu names them. */
  lord: string;
  graha: GrahaId;
  element: string;
  /** What belongs here. */
  best: string[];
  /** What should not be here, and why. */
  avoid: string[];
};

export const DIRECTIONS: Direction[] = [
  {
    id: 'north', name: 'North', np: 'उत्तर', lord: 'Kubera', graha: 'mercury', element: 'Water',
    best: ['Main entrance', 'Cash box or safe', 'Living room', 'Water tank at ground level'],
    avoid: ['Toilet — it is held to drain the household’s money', 'Heavy storage that blocks the direction'],
  },
  {
    id: 'northeast', name: 'North-east', np: 'ईशान', lord: 'Ishana', graha: 'jupiter', element: 'Water',
    best: ['Puja room — the single most important placement in a Nepali house', 'Well or water source', 'Open space, kept light'],
    avoid: ['Kitchen or any fire', 'Toilet', 'Staircase', 'Bedroom for the head of the household'],
  },
  {
    id: 'east', name: 'East', np: 'पूर्व', lord: 'Indra', graha: 'sun', element: 'Air',
    best: ['Main entrance', 'Windows for the morning sun', 'Children’s study', 'Bathroom without a toilet'],
    avoid: ['Tall trees or walls that block the sunrise', 'Heavy clutter'],
  },
  {
    id: 'southeast', name: 'South-east', np: 'आग्नेय', lord: 'Agni', graha: 'venus', element: 'Fire',
    best: ['Kitchen, with the cook facing east', 'Electrical panel', 'Gas cylinder', 'Inverter'],
    avoid: ['Puja room', 'Main bedroom', 'Water storage — fire and water quarrel here'],
  },
  {
    id: 'south', name: 'South', np: 'दक्षिण', lord: 'Yama', graha: 'mars', element: 'Earth',
    best: ['Main bedroom', 'Heavy furniture and storage', 'Tall walls'],
    avoid: ['Main entrance, unless the plot forces it', 'Open water', 'Puja room'],
  },
  {
    id: 'southwest', name: 'South-west', np: 'नैऋत्य', lord: 'Nirrti', graha: 'rahu', element: 'Earth',
    best: ['Master bedroom — the heaviest, most settled corner', 'Wardrobes and heavy almirahs', 'The highest part of the house'],
    avoid: ['Kitchen', 'Toilet', 'Any opening or pit', 'Keeping it lower than the rest of the plot'],
  },
  {
    id: 'west', name: 'West', np: 'पश्चिम', lord: 'Varuna', graha: 'saturn', element: 'Water',
    best: ['Dining room', 'Children’s bedroom', 'Study', 'Store room'],
    avoid: ['Main water tank underground', 'Leaving it entirely open'],
  },
  {
    id: 'northwest', name: 'North-west', np: 'वायव्य', lord: 'Vayu', graha: 'moon', element: 'Air',
    best: ['Guest room', 'Toilet, if one must be placed', 'Grain and food storage', 'Garage'],
    avoid: ['Master bedroom — it is the restless corner', 'Puja room'],
  },
];

export type RoomGuide = {
  room: string;
  np: string;
  best: string[];
  avoid: string[];
  note: string;
};

export const ROOMS: RoomGuide[] = [
  { room: 'Puja room', np: 'पूजा कोठा', best: ['North-east'], avoid: ['South', 'South-west', 'Under a staircase', 'Sharing a wall with a toilet'], note: 'Face east or north while praying. Keep the idols off the floor and not directly facing each other.' },
  { room: 'Kitchen', np: 'भान्सा', best: ['South-east'], avoid: ['North-east', 'South-west'], note: 'The cook should face east. Keep the stove and the sink apart — fire and water should not share a slab.' },
  { room: 'Master bedroom', np: 'सुत्ने कोठा', best: ['South-west'], avoid: ['North-east', 'South-east'], note: 'Sleep with the head to the south or east. Avoid a mirror facing the bed.' },
  { room: 'Main entrance', np: 'मुख्य ढोका', best: ['North', 'East', 'North-east'], avoid: ['South-west'], note: 'The door should open inward and clockwise. Keep the entrance lit and free of shoes and clutter.' },
  { room: 'Toilet', np: 'शौचालय', best: ['North-west', 'West'], avoid: ['North-east', 'South-west', 'Centre of the house'], note: 'Keep the door closed. It should not share a wall with the kitchen or the puja room.' },
  { room: 'Study', np: 'पढ्ने ठाउँ', best: ['East', 'North', 'North-east'], avoid: ['South-west'], note: 'Face east or north while studying. Do not sit with your back to the door.' },
  { room: 'Cash box or safe', np: 'तिजोरी', best: ['North', 'South-west'], avoid: ['South-east'], note: 'A safe in the south-west should open towards the north — towards Kubera.' },
  { room: 'Staircase', np: 'भर्‍याङ', best: ['South', 'West', 'South-west'], avoid: ['North-east', 'Centre'], note: 'Stairs should climb clockwise, and have an odd number of steps.' },
  { room: 'Water tank', np: 'पानी ट्यांकी', best: ['North-east at ground level', 'South-west if overhead'], avoid: ['Overhead tank in the north-east'], note: 'Underground water in the north-east, overhead in the south-west — the weight belongs in the heavy corner.' },
];

export type VastuReading = {
  directions: Direction[];
  rooms: RoomGuide[];
  /** Present only when a chart is available. */
  personal: {
    favourableDirection: string;
    reason: string;
    /** The grahas weakest in this chart, whose corners want attention. */
    weakGrahas: { graha: GrahaId; name: string; direction: string; remedy: string }[];
  } | null;
};

/**
 * Vastu guidance, personalised where a chart allows it.
 *
 * The generic tables are the same for everyone. What a chart adds is a
 * direction to favour — the one belonging to the lagna lord — and a short
 * list of the grahas that are genuinely weak in this chart, so the household
 * remedies are aimed where they are needed rather than scattered.
 */
export function vastuFor(chart: Chart | null): VastuReading {
  if (!chart) return { directions: DIRECTIONS, rooms: ROOMS, personal: null };

  const lagnaLord = chart.lagna.lord;

  // The three weakest grahas in the chart, excluding any already strong.
  const weak = Object.values(chart.grahas)
    .filter((g) => g.strength < 45)
    .sort((a, b) => a.strength - b.strength)
    .slice(0, 3)
    .map((g) => ({
      graha: g.graha.id,
      name: g.graha.vedic,
      direction: GRAHA_TRAITS[g.graha.id].direction,
      remedy: `Keep the ${GRAHA_TRAITS[g.graha.id].direction.toLowerCase()} of the house clean and uncluttered, and use ${GRAHA_TRAITS[g.graha.id].colours[0].toLowerCase()} there.`,
    }));

  return {
    directions: DIRECTIONS,
    rooms: ROOMS,
    personal: {
      favourableDirection: GRAHA_TRAITS[lagnaLord].direction,
      reason: `${GRAHAS[lagnaLord].vedic} rules your ${chart.lagna.vedic} lagna, and it governs the ${GRAHA_TRAITS[lagnaLord].direction.toLowerCase()}. Sit, study and sleep facing it where the house allows.`,
      weakGrahas: weak,
    },
  };
}
