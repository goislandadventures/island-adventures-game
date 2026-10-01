export interface TutorialDay {
  day:number;
  title:string;
  summary:string;
  lessons:string[];
  goal:string;
}

export const weekOneTutorial: TutorialDay[] = [
  {
    day:1,
    title:'Open the doors',
    summary:'Build the minimum viable charter company, then make captain decisions trip by trip.',
    lessons:[
      'Rent a slip, buy a boat, and insure it before taking guests.',
      'Watch cash carefully: the cheapest boat can cost more later if reliability is poor.',
      'Read the Captain’s Report before every operating day.',
      'Weather decisions are made per charter. One trip can run normally while another moves to protected water.'
    ],
    goal:'Get both Day 1 charters home safely and profitably.'
  },
  {
    day:2,
    title:'Price for profit',
    summary:'Learn how your charter menu affects demand and margin.',
    lessons:[
      'Trip prices affect both revenue per booking and how easily customers convert.',
      'Sandbar, snorkel, and sunset trips have different demand and weather tolerance.',
      'A full calendar at bad prices can be worse than fewer profitable trips.'
    ],
    goal:'Review your trip prices before running the day.'
  },
  {
    day:3,
    title:'Protect the boat',
    summary:'Your boat is both your biggest tool and one of your biggest financial risks.',
    lessons:[
      'Fuel burn changes the real profit from every trip.',
      'Condition and reliability affect maintenance risk.',
      'Rougher operating choices can increase wear.',
      'Leaving cash in reserve matters when something breaks.'
    ],
    goal:'Finish the day with enough cash to absorb an unexpected repair.'
  },
  {
    day:4,
    title:'Know where bookings come from',
    summary:'Not every customer arrives the same way.',
    lessons:[
      'Bookings can come from organic search, maps, referrals, social, hotels, repeat guests, paid ads, and marketplaces.',
      'The source matters because future marketing systems will have different costs and conversion quality.',
      'Strong reviews and reputation make future demand easier to win.'
    ],
    goal:'Notice the source attached to each booking and start learning which customers are most valuable.'
  },
  {
    day:5,
    title:'Run the business, not just the boat',
    summary:'Revenue is not the same thing as profit.',
    lessons:[
      'The Books tab tracks revenue, operating expenses, and lifetime profit.',
      'Company value includes more than cash: fleet assets, reputation, debt, and profit matter.',
      'Growth that destroys cash flow can still sink the company.'
    ],
    goal:'Check your books after the day and understand exactly where the money went.'
  },
  {
    day:6,
    title:'Build a reputation',
    summary:'Reviews compound over time and affect your ability to compete.',
    lessons:[
      'Guest satisfaction comes from the actual trip: conditions, boat quality, captain decisions, and expectations.',
      'Adapting intelligently to weather can protect both reviews and equipment.',
      'Public leaderboards compare registered owners by value, revenue, profit, review count, and rating.'
    ],
    goal:'Make decisions that protect long-term reputation instead of chasing one day of revenue.'
  },
  {
    day:7,
    title:'You’re the boss now',
    summary:'The tutorial ends, but the operating loop stays the same as the company grows.',
    lessons:[
      'Check conditions, demand, cash, and boat condition before committing the day.',
      'Choose the right plan for each charter instead of using one rule for every trip.',
      'Reinvest carefully and grow only when the business can support it.',
      'New systems added to Island Adventures will be introduced through this Week 1 guide.'
    ],
    goal:'Run Day 7 without relying on the tutorial. From here, build the best charter company in the islands.'
  }
];

export function tutorialForDay(day:number): TutorialDay | null {
  return weekOneTutorial.find(item=>item.day===day) ?? null;
}
