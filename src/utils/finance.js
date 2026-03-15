export const fmt  = n => `£${Math.abs(n).toFixed(2)}`;
export const fmtK = n => n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${Math.round(n)}`;

export const CAT_RULES = [
  [/RENT|LETTINGS|LANDLORD/i,                                                                    "Rent"],
  [/TESCO|SAINSBURY|ASDA|MORRISONS|LIDL|ALDI|WAITROSE|CO-OP|COOP|OCADO|ICELAND|WHOLE FOODS/i,  "Groceries"],
  [/TFL |LIME BIKE|TRAINLINE|NATIONAL RAIL|ZIPCAR|OVERGROUND|TUBE |HEATHROW/i,                  "Transport"],
  [/UBER(?! EATS)/i,                                                                             "Transport"],
  [/COSTA|STARBUCKS|PRET|CAFFE NERO|DELIVEROO|JUST.?EAT|UBER EATS|MCDONALDS|KFC|PIZZA|NANDO|GREGGS|WASABI/i, "Eating Out & Cafes"],
  [/RESTAURANT|CAFE |COFFEE SHOP|SUSHI/i,                                                       "Eating Out & Cafes"],
  [/SPOTIFY|NETFLIX|APPLE\.COM|AMAZON PRIME|DISNEY\+|YOUTUBE PREMIUM|NOW TV|STREAMING/i,       "Subscriptions"],
  [/PUREGYM|FITNESS FIRST|DAVID LLOYD|VIRGIN ACTIVE|NUFFIELD HEALTH|GYM/i,                     "Gym & Fitness"],
  [/^O2 |O2 MOBILE|EE MOBILE|VODAFONE|THREE MOBILE|PHONE BILL|GIFFGAFF|PHONE CONTRACT/i,       "Phone Bill"],
  [/HOSPITAL|PHARMACY|NHS|DENTIST|OPTICIAN|MEDICAL|CLINIC|GP |HEALTH CENTRE/i,                 "Healthcare"],
  [/AMAZON(?! PRIME)|EBAY|ASOS|ZARA|H&M|PRIMARK|UNIQLO|BOOHOO|NIKE|ADIDAS|JOHN LEWIS|IKEA|ARGOS|CLOTHING/i, "Shopping"],
  [/PUB | BAR |CLUB |CINEMA|ODEON|VUE |CINEWORLD|BOWLING|THEATRE|COMEDY|CONCERT|NIGHT OUT|LIVE MUSIC/i, "Entertainment & Nights Out"],
];

export const INC_RULES = [
  [/SALARY|PAYROLL|WAGES|EMPLOYER/i,   "Salary"],
  [/FREELANCE|CONTRACT|INVOICE/i,      "Freelance"],
  [/BONUS/i,                           "Bonus"],
  [/SIDE INCOME|SELLING|MARKETPLACE/i, "Side Income"],
];

export const autocat    = d => CAT_RULES.find(([r]) => r.test(d))?.[1] ?? "Other";
export const autocatInc = d => INC_RULES.find(([r]) => r.test(d))?.[1] ?? "Other Income";
