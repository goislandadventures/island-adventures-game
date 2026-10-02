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
    title:'Build your first little boat business',
    summary:'You have $10,000, no boat, and no clue what kind of day is coming. That is enough to start.',
    lessons:[
      'Pick a marina. Think of the slip as your boat’s parking spot. Nicer marinas cost more, can make insurance pricier, and can attract better tips.',
      'Shop the boat, not just the year. Hull age, engine age, engine hours, condition, and reliability all matter.',
      'Need a better boat? You can take one startup loan up to $20,000. It helps today, but the high-interest payment follows you every single day.',
      'Insurance is optional. Skipping it saves money now. If a major hurricane destroys an uninsured boat later, that boat is simply gone.',
      'Before each trip, read the weather and decide for yourself. Nothing is preselected. You are the captain.'
    ],
    goal:'Get a slip, get a boat, make your insurance/debt choices, then finish your first day without running out of cash.'
  },
  {
    day:2,
    title:'Make people actually find you',
    summary:'A great boat with zero guests is just an expensive floating chair.',
    lessons:[
      'Open Grow. Google Search can find guests who are ready to book, but it is the most expensive place to compete.',
      'Maps is strong for nearby visitors. Social is cheaper but usually lower intent. Hotels send warmer guests but take a referral cut. Content/PR is slower but can build long-term discovery.',
      'Real players affect the market. If every active player piles into the same channel, that channel becomes crowded, your dollars buy less, and the other channels may become bargains.',
      'Your daily marketing budget is a hard cap. Crowding does not charge beyond it; it makes each dollar less effective.',
      'No bookings today? You are not stuck. Work on the boat or close the day and try again tomorrow.'
    ],
    goal:'Choose a marketing channel and budget you can afford, then see whether the phone starts ringing.'
  },
  {
    day:3,
    title:'Boats are hungry little money monsters',
    summary:'Every trip earns money and quietly adds wear to the boat underneath you.',
    lessons:[
      'Every trip adds exactly 90 minutes to that boat’s engine hours.',
      'Engines need a 100-hour service and a bigger 300-hour service. If the 300-hour service is due, it covers the 100-hour service at the same time.',
      'A 100-hour service costs about half of the 300-hour service. Skip either too long and reliability begins to fall.',
      'Quiet days are useful. A dock check or scheduled service can be smarter than waiting for something expensive to break.'
    ],
    goal:'Open Fleet, find your engine hours, and know which service comes next.'
  },
  {
    day:4,
    title:'One captain can only drive one boat',
    summary:'More boats can make more money, but only when you have people to run them.',
    lessons:[
      'You run the first boat yourself. Every extra boat needs another captain before it adds real daily capacity.',
      'Groups of 7–12 need two boats and two captains working together.',
      'Captains cost money only when they run trips, and better captains cost more.',
      'Another boat also means another engine clock, more fuel, more maintenance, and another thing a hurricane can destroy.'
    ],
    goal:'Use Fleet to understand exactly what a second working boat would require before buying one.'
  },
  {
    day:5,
    title:'Busy does not always mean profitable',
    summary:'A full calendar feels great until the bills start taking bites out of every trip.',
    lessons:[
      'Fares are only the top line. Fuel, boat wear, captain pay, marketing, loan payments, marina costs, service, and booking fees all come out underneath.',
      'Direct bookings keep more of the fare. Marketplace and hotel bookings can bring guests, but they cost you commission.',
      'Tips can be huge on a great trip—sometimes up to 40%—but some guests never tip no matter how good the day was.',
      'Four stars or lower means no tip. Five stars give you a chance at one, not a guarantee.'
    ],
    goal:'Open Books and figure out what you actually kept after the money came in and went back out.'
  },
  {
    day:6,
    title:'Five stars are earned, not rolled',
    summary:'The game does not randomly steal stars from you. Your decisions create the review.',
    lessons:[
      'Different guests care about different things. Families want comfort, serious snorkelers care about visibility, and premium guests notice a tired-looking boat.',
      'Weather decisions happen trip by trip. A sandbar trip may run normally while snorkeling moves to calmer water.',
      'Poor maintenance, rough choices, bad visibility, and unnecessary plan changes can all cost stars.',
      'Ask happy guests for reviews. Reviews help future guests trust you and make your marketing stronger.'
    ],
    goal:'Finish every trip you can as a 5★ trip—and understand exactly why any trip falls short.'
  },
  {
    day:7,
    title:'Now the real game starts',
    summary:'Tomorrow I stop telling you what to look at. The islands, bills, weather, and other players keep moving anyway.',
    lessons:[
      'Every game begins February 1. Business starts a little slow, then strong marketers can get very busy from February 14 through September 1.',
      'After September 1, slow season hits hard. Strong marketers may hold about half of busy-season demand; weak marketers can fall near one-fifth.',
      'Hurricane season runs June through November. When a hurricane appears, decide whether to pay to haul the fleet or gamble with the boats in the water.',
      'Category 3, 4, or 5 destroys boats left in the water. Insurance may soften the loss; no insurance means no boat.',
      'After Captain School, used boats, financing, captains, live marketing competition, expansion, owner events, and the leaderboards are all yours to manage.'
    ],
    goal:'Finish Day 7. From Day 8 on, build the company your way and try not to go broke doing it.'
  }
];

export function tutorialForDay(day:number): TutorialDay | null {
  return weekOneTutorial.find(item=>item.day===day) ?? null;
}
