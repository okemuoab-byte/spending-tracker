export const fmt  = n => `£${Math.abs(n).toFixed(2)}`;
export const fmtK = n => n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${Math.round(n)}`;

export const CAT_RULES = [
  [/THOMAS KNIGHT|RENT|LETTINGS|LANDLORD/i,                                                     "Rent"],
  [/TESCO|SAINSBURY|ASDA|MORRISONS|LIDL|ALDI|WAITROSE|CO-OP|COOP|OCADO|ICELAND|WHOLE FOODS/i,  "Groceries"],
  [/TFL |LIME BIKE|TRAINLINE|NATIONAL RAIL|ZIPCAR|OVERGROUND|TUBE |HEATHROW/i,                  "Transport"],
  [/UBER(?! EATS)/i,                                                                             "Transport"],
  [/COSTA|STARBUCKS|PRET|CAFFE NERO|DELIVEROO|JUST.?EAT|UBER EATS|MCDONALDS|KFC|PIZZA|NANDO|FLAT IRON|BANCONE|CYNTHIA|GREGGS|WASABI/i, "Eating Out & Cafes"],
  [/RESTAURANT|CAFE |COFFEE SHOP|SUSHI/i,                                                       "Eating Out & Cafes"],
  [/SPOTIFY|NETFLIX|APPLE\.COM|AMAZON PRIME|DISNEY\+|LINKEDIN PREMIUM|YOUTUBE PREMIUM|NOW TV/i,"Subscriptions"],
  [/PUREGYM|FITNESS FIRST|DAVID LLOYD|VIRGIN ACTIVE|NUFFIELD HEALTH/i,                          "Gym & Fitness"],
  [/^O2 |O2 MOBILE|EE MOBILE|VODAFONE|THREE MOBILE|PHONE BILL|GIFFGAFF/i,                      "Phone Bill"],
  [/HOSPITAL|BOOTS OPTICIANS|BOOTS PHARMACY|NHS|DENTIST|OPTICIAN|ROYAL FREE|WHITTINGTON|PHARMACY|MEDICAL|CLINIC/i, "Healthcare"],
  [/AMAZON(?! PRIME)|EBAY|ASOS|ZARA|H&M|PRIMARK|UNIQLO|BOOHOO|MOSS BROS|CALVIN KLEIN|NIKE|ADIDAS|JOHN LEWIS|IKEA|ARGOS/i, "Shopping"],
  [/SIMMONS| PUB | BAR |CLUB |CINEMA|ODEON|VUE |CINEWORLD|BOWLING|ROXY|BIERKELLER|THEATRE|COMEDY|CONCERT|TED LOCO|KING.?S ARMS|ROWANS/i, "Entertainment & Nights Out"],
];

export const INC_RULES = [
  [/NHSBSA|NHS BURSARY/i,               "NHS Bursary"],
  [/UCL|FRONTIER OPERATIONS|STIPEND/i,  "UCL Stipend"],
  [/SLC|STUDENT LOAN|STUDENT FINANCE/i, "Student Loan"],
];

export const autocat    = d => CAT_RULES.find(([r]) => r.test(d))?.[1] ?? "Other";
export const autocatInc = d => INC_RULES.find(([r]) => r.test(d))?.[1] ?? "Family Support";
