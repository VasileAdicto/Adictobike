import { Step, Rule, Operator } from './types';

export const INITIAL_STEPS: Step[] = [
  {
    id: 'frame',
    title: 'Frame Selection',
    options: [
      { id: 'f1', name: 'Aero Carbon Pro', brand: 'VeloCraft', price: 2500, weight: 950, imageUrl: 'https://picsum.photos/seed/frame1/800/600', zIndex: 10 },
      { id: 'f2', name: 'Endurance SL', brand: 'VeloCraft', price: 1800, weight: 1100, imageUrl: 'https://picsum.photos/seed/frame2/800/600', zIndex: 10 },
    ]
  },
  {
    id: 'wheels',
    title: 'Wheels',
    options: [
      { id: 'w1', name: 'Deep Section 50mm', brand: 'Zipp', price: 1500, weight: 1450, imageUrl: 'https://picsum.photos/seed/wheel1/800/600', zIndex: 5 },
      { id: 'w2', name: 'Climbing Lightweight', brand: 'Enve', price: 2200, weight: 1200, imageUrl: 'https://picsum.photos/seed/wheel2/800/600', zIndex: 5 },
    ]
  },
  {
    id: 'tyres',
    title: 'Tyres',
    options: [
      { id: 't1', name: 'GP5000 S TR', brand: 'Continental', price: 120, weight: 500, imageUrl: 'https://picsum.photos/seed/tyre1/800/600', zIndex: 6 },
      { id: 't2', name: 'Corsa Pro', brand: 'Vittoria', price: 140, weight: 520, imageUrl: 'https://picsum.photos/seed/tyre2/800/600', zIndex: 6 },
    ]
  },
  {
    id: 'shifters',
    title: 'Shifters',
    options: [
      { id: 's1', name: 'Dura-Ace Di2', brand: 'Shimano', price: 800, weight: 350, imageUrl: 'https://picsum.photos/seed/shifter1/800/600', zIndex: 15 },
      { id: 's2', name: 'Red eTap AXS', brand: 'SRAM', price: 850, weight: 340, imageUrl: 'https://picsum.photos/seed/shifter2/800/600', zIndex: 15 },
    ]
  },
  {
    id: 'derailleurs',
    title: 'Derailleurs',
    options: [
      { id: 'd1', name: 'Dura-Ace Rear', brand: 'Shimano', price: 600, weight: 210, imageUrl: 'https://picsum.photos/seed/der1/800/600', zIndex: 12 },
      { id: 'd2', name: 'Red AXS Rear', brand: 'SRAM', price: 650, weight: 220, imageUrl: 'https://picsum.photos/seed/der2/800/600', zIndex: 12 },
    ]
  },
  {
    id: 'cassette',
    title: 'Cassette',
    options: [
      { id: 'c1', name: '11-30T 12sp', brand: 'Shimano', price: 250, weight: 220, imageUrl: 'https://picsum.photos/seed/cas1/800/600', zIndex: 11 },
      { id: 'c2', name: '10-33T 12sp', brand: 'SRAM', price: 300, weight: 210, imageUrl: 'https://picsum.photos/seed/cas2/800/600', zIndex: 11 },
    ]
  },
  {
    id: 'crankset',
    title: 'Crankset',
    options: [
      { id: 'cr1', name: 'Dura-Ace 52/36', brand: 'Shimano', price: 550, weight: 690, imageUrl: 'https://picsum.photos/seed/crank1/800/600', zIndex: 13 },
      { id: 'cr2', name: 'Red AXS 48/35', brand: 'SRAM', price: 600, weight: 710, imageUrl: 'https://picsum.photos/seed/crank2/800/600', zIndex: 13 },
    ]
  },
  {
    id: 'saddle',
    title: 'Saddle',
    options: [
      { id: 'sa1', name: 'Antares Versus Evo', brand: 'Fizik', price: 280, weight: 180, imageUrl: 'https://picsum.photos/seed/sad1/800/600', zIndex: 14 },
      { id: 'sa2', name: 'S-Works Power', brand: 'Specialized', price: 300, weight: 160, imageUrl: 'https://picsum.photos/seed/sad2/800/600', zIndex: 14 },
    ]
  },
  {
    id: 'handlebars',
    title: 'Handlebars',
    options: [
      { id: 'h1', name: 'Aero Integrated', brand: 'VeloCraft', price: 450, weight: 380, imageUrl: 'https://picsum.photos/seed/hb1/800/600', zIndex: 16 },
      { id: 'h2', name: 'Classic Round', brand: 'Deda', price: 120, weight: 250, imageUrl: 'https://picsum.photos/seed/hb2/800/600', zIndex: 16 },
    ]
  },
  {
    id: 'bartape',
    title: 'Bar Tape',
    options: [
      { id: 'bt1', name: 'Super Sticky Kush', brand: 'Supacaz', price: 40, weight: 50, imageUrl: 'https://picsum.photos/seed/bt1/800/600', zIndex: 17 },
      { id: 'bt2', name: 'Vento Solocush', brand: 'Fizik', price: 35, weight: 60, imageUrl: 'https://picsum.photos/seed/bt2/800/600', zIndex: 17 },
    ]
  }
];

export const INITIAL_RULES: Rule[] = [
  {
    id: 'r1',
    condition: { stepId: 'shifters', operator: Operator.EQUALS, value: 's1' }, // Shimano Shifters
    action: { type: Operator.HIDE, targetStepId: 'derailleurs', targetComponentId: 'd2' } // Hide SRAM Derailleur
  },
  {
    id: 'r2',
    condition: { stepId: 'shifters', operator: Operator.EQUALS, value: 's2' }, // SRAM Shifters
    action: { type: Operator.HIDE, targetStepId: 'derailleurs', targetComponentId: 'd1' } // Hide Shimano Derailleur
  }
];
