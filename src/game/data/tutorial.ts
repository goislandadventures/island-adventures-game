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
    title:'Get a boat. Get some guests.',
    summary:'You have $10,000, no boat, and one week to figure this out. Start simple.',
    lessons:[
      'Pick a marina. A slip is just a parking spot for your boat.',
      'Look at the hull year, engine year, and engine hours separately. An old boat with a newer low-hour engine can be a great deal.',
      'You can stay debt-free or take one startup loan up to $20,000. The interest is painful and the payment comes every day.',
      'Insurance is your choice. It costs money, but an uninsured boat can become a total loss later.',
      'Check the weather before every trip. A sandbar trip and a snorkel trip can need totally different plans.'
    ],
    goal:'Get a marina, pick a boat, decide on insurance and debt, then finish Day 1 with cash still in the bank.'
  },
  {
    day:2,
    title:'Make the phone ring',
    summary:'Guests cannot book you if they never hear about you.',
    lessons:[
      'You can spend money on Search, Maps, Social, Hotels, or Content to help people find you.',
      'More marketing can bring more bookings, but the money leaves your bank account whether the phone rings or not.',
      'If nobody books today, you are not stuck. Work on the boat or close the day and try again tomorrow.',
      'A good price helps you get booked. A good trip helps people come back.',
      'Ask happy guests for reviews. Great reviews make future bookings easier.'
    ],
    goal:'Pick a marketing plan and try to fill the calendar without burning all your cash.'
  },
  {
    day:3,
    title:'Boats eat money',
    summary:'Fuel, repairs and engine service are part of owning a boat. Ignore them and the boat gets revenge.',
    lessons:[
      'Every trip adds 90 minutes to the engine clock.',
      'Engines need a 100-hour service and a bigger 300-hour service.',
      'When the 300-hour service is due, it also covers the 100-hour service at that same time.',
      'Skip service too long and reliability starts falling. That means more breakdowns and worse trips.'
    ],
    goal:'Check the Fleet tab and know when your next engine service is due.'
  },
  {
    day:4,
    title:'One boat is easy. Two boats is chaos.',
    summary:'More boats can make more money, but only if somebody can drive them.',
    lessons:[
      'You can run one boat yourself.',
      'Hire another captain before expecting a second boat to earn money.',
      'Groups of 7–12 need two boats and two captains.',
      'Extra boats also mean more fuel, service, insurance and surprise repair bills.'
    ],
    goal:'Learn what it takes to run two boats before you rush out and buy one.'
  },
  {
    day:5,
    title:'Where did all the money go?',
    summary:'A day can look busy and still barely make money.',
    lessons:[
      'Fares come in, then fuel, boat wear, loan payments, captain pay, marketing and booking fees start taking bites out of it.',
      'Some websites can take a big cut of a booking. Direct bookings keep more money in your pocket.',
      'Tips help, but never count on them. Some guests do not tip even after a perfect day.',
      'Any trip below 5★ gets no tip at all.'
    ],
    goal:'Open the Books tab and see what you really kept after the day was over.'
  },
  {
    day:6,
    title:'Chase the five stars',
    summary:'Five stars are not random. The choices you make create the review.',
    lessons:[
      'A good captain changes the plan when the weather says to change it.',
      'Snorkelers care about clear water. Families care about comfort. Premium guests notice the boat.',
      'If the game shows a reason a trip may lose a star, fix that reason before you leave the dock.',
      'Ask happy guests for reviews. More great reviews help future guests trust you.'
    ],
    goal:'Try to send every completed trip home as a 5★ trip.'
  },
  {
    day:7,
    title:'You are running the show now',
    summary:'Tomorrow the training wheels come off.',
    lessons:[
      'Busy season begins February 14 and runs through September 1. Good marketing matters a lot.',
      'After September 1, business gets painfully slow unless you have built a strong name and strong marketing.',
      'Hurricane season runs June through November. Later, you may have to choose whether to haul the boats or gamble with them in the water.',
      'New islands, bigger groups, more boats and more bills are waiting after Captain School.'
    ],
    goal:'Finish Day 7, then build the company any way you want.'
  }
];

export function tutorialForDay(day:number): TutorialDay | null {
  return weekOneTutorial.find(item=>item.day===day) ?? null;
}
