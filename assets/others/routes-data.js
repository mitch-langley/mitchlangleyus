const routeData = {
  "A": {
    "title": "Rio Grande & Borderlands",
    "daysCount": 5,
    "color": "#9b5c3f",
    "summary": "A true southern-border crossing: Spanish-colonial history, Lower Pecos rock art, the Rio Grande, Big Bend, mining Arizona and the Sonoran Desert.",
    "scores": {
      "hike": 8,
      "hist": 9,
      "pace": 4
    },
    "why": "This is the strongest choice if the goal is to make Trip #3 feel genuinely different from both previous crossings. The landscapes and historical themes are coherent all the way from South Texas to southern Arizona.",
    "days": [
      {
        "title": "Atlanta → Lafayette",
        "text": "Mostly a mileage day. Save the distinctive stops for farther west.",
        "stopIds": [
          "atlanta",
          "lafayette"
        ],
        "endStopId": "lafayette",
        "drive": [
          "atlanta",
          {
            "name": "I-65 Mobile",
            "coordinates": [
              -88.078,
              30.688
            ]
          },
          "lafayette"
        ]
      },
      {
        "title": "Lafayette → San Antonio → Del Rio",
        "text": "Mission San José for Spanish-colonial history, then continue west on US‑90.",
        "stopIds": [
          "san-antonio",
          "del-rio"
        ],
        "endStopId": "del-rio",
        "drive": [
          "lafayette",
          "san-antonio",
          {
            "name": "US 90 Uvalde",
            "coordinates": [
              -99.786,
              29.209
            ]
          },
          "del-rio"
        ]
      },
      {
        "title": "Del Rio → Seminole Canyon → Big Bend",
        "text": "Lower Pecos rock-art country, then Santa Elena Canyon on the Rio Grande.",
        "stopIds": [
          "seminole-canyon",
          "santa-elena",
          "big-bend"
        ],
        "endStopId": "big-bend",
        "drive": [
          "del-rio",
          "seminole-canyon",
          {
            "name": "US 90 Sanderson",
            "coordinates": [
              -102.394,
              30.142
            ]
          },
          {
            "name": "US 385 Marathon",
            "coordinates": [
              -103.244,
              30.207
            ]
          },
          "big-bend",
          {
            "name": "Ross Maxwell Scenic Drive",
            "coordinates": [
              -103.371,
              29.282
            ]
          },
          "santa-elena",
          {
            "name": "Ross Maxwell Scenic Drive",
            "coordinates": [
              -103.371,
              29.282
            ]
          },
          "big-bend"
        ]
      },
      {
        "title": "Big Bend → El Paso → Chiricahua → Bisbee",
        "text": "Cross the Trans-Pecos; hike among Chiricahua’s volcanic pinnacles; overnight in historic Bisbee.",
        "stopIds": [
          "el-paso",
          "chiricahua",
          "bisbee"
        ],
        "endStopId": "bisbee",
        "drive": [
          "big-bend",
          {
            "name": "TX 118 Study Butte",
            "coordinates": [
              -103.533,
              29.328
            ]
          },
          {
            "name": "US 90 Alpine",
            "coordinates": [
              -103.661,
              30.358
            ]
          },
          "el-paso",
          {
            "name": "I-10 Willcox",
            "coordinates": [
              -109.833,
              32.253
            ]
          },
          "chiricahua",
          {
            "name": "AZ 181 west",
            "coordinates": [
              -109.684,
              31.882
            ]
          },
          "bisbee"
        ]
      },
      {
        "title": "Bisbee → Organ Pipe Cactus → San Diego",
        "text": "Finish through the Sonoran border desert and cross into California near Yuma.",
        "stopIds": [
          "organ-pipe",
          "san-diego"
        ],
        "endStopId": "san-diego",
        "drive": [
          "bisbee",
          {
            "name": "AZ 86 Sells",
            "coordinates": [
              -111.881,
              31.912
            ]
          },
          "organ-pipe",
          {
            "name": "AZ 85 Why",
            "coordinates": [
              -112.738,
              32.261
            ]
          },
          {
            "name": "I-8 Gila Bend",
            "coordinates": [
              -112.718,
              32.947
            ]
          },
          {
            "name": "I-8 Yuma",
            "coordinates": [
              -114.62,
              32.704
            ]
          },
          "san-diego"
        ]
      }
    ],
    "points": [
      {
        "id": "atlanta",
        "name": "Atlanta",
        "coordinates": [
          -84.388,
          33.749
        ],
        "day": 1,
        "role": "origin"
      },
      {
        "id": "lafayette",
        "name": "Lafayette",
        "coordinates": [
          -92.0198,
          30.2241
        ],
        "day": 1,
        "role": "overnight"
      },
      {
        "id": "san-antonio",
        "name": "San Antonio",
        "coordinates": [
          -98.4794,
          29.3625
        ],
        "day": 2,
        "role": "stop",
        "access": "Mission San José visitor parking",
        "source": "https://www.nps.gov/saan/planyourvisit/directions.htm"
      },
      {
        "id": "del-rio",
        "name": "Del Rio",
        "coordinates": [
          -100.8959,
          29.3709
        ],
        "day": 2,
        "role": "overnight"
      },
      {
        "id": "seminole-canyon",
        "name": "Seminole Canyon",
        "coordinates": [
          -101.3132,
          29.7005
        ],
        "day": 3,
        "role": "stop",
        "access": "State park headquarters",
        "source": "https://tpwd.texas.gov/state-parks/seminole-canyon"
      },
      {
        "id": "santa-elena",
        "name": "Santa Elena Canyon",
        "coordinates": [
          -103.6108,
          29.1675
        ],
        "day": 3,
        "role": "stop",
        "access": "Trailhead parking at the end of Ross Maxwell Scenic Drive",
        "source": "https://www.nps.gov/thingstodo/hike-into-santa-elena-canyon.htm"
      },
      {
        "id": "big-bend",
        "name": "Big Bend",
        "coordinates": [
          -103.2067,
          29.3289
        ],
        "day": 3,
        "role": "overnight",
        "access": "Panther Junction is the representative access point; lodging location is not fixed",
        "source": "https://www.nps.gov/bibe/planyourvisit/visitorcenters.htm"
      },
      {
        "id": "el-paso",
        "name": "El Paso",
        "coordinates": [
          -106.485,
          31.7619
        ],
        "day": 4,
        "role": "stop"
      },
      {
        "id": "chiricahua",
        "name": "Chiricahua",
        "coordinates": [
          -109.3565,
          32.0052
        ],
        "day": 4,
        "role": "stop",
        "access": "Visitor center via AZ 186 and AZ 181",
        "source": "https://www.nps.gov/chir/planyourvisit/directions.htm"
      },
      {
        "id": "bisbee",
        "name": "Bisbee",
        "coordinates": [
          -109.9284,
          31.4482
        ],
        "day": 4,
        "role": "overnight"
      },
      {
        "id": "organ-pipe",
        "name": "Organ Pipe Cactus",
        "coordinates": [
          -112.8014,
          31.9542
        ],
        "day": 5,
        "role": "stop",
        "access": "Kris Eggle Visitor Center via AZ 85",
        "source": "https://www.nps.gov/orpi/planyourvisit/directions.htm"
      },
      {
        "id": "san-diego",
        "name": "San Diego",
        "coordinates": [
          -117.1611,
          32.7157
        ],
        "day": 5,
        "role": "destination"
      }
    ],
    "travelMonth": "2026-10",
    "overnightNote": "Overnight markers show provisional areas, not booked lodging. Park access points represent the area until lodging is selected.",
    "seasonNote": "October 2026 planning route. Confirm park access and road conditions before traveling."
  },
  "B": {
    "title": "Great Plains, Rockies & Utah",
    "daysCount": 5,
    "color": "#6c7e4d",
    "summary": "A classic westward transect: Mississippi River, Great Plains, Rocky Mountains, Colorado Plateau, St. George red rock and the Mojave.",
    "scores": {
      "hike": 7,
      "hist": 7,
      "pace": 3
    },
    "why": "This has the clearest sense of physically crossing the continent and gets to California in five days while avoiding a repeat of the I‑40 corridor from Trip #1.",
    "days": [
      {
        "title": "Atlanta → St. Louis",
        "text": "Push northwest to the Mississippi; Gateway Arch / river-history stop.",
        "stopIds": [
          "atlanta",
          "st-louis"
        ],
        "endStopId": "st-louis",
        "drive": [
          "atlanta",
          {
            "name": "I-24 Nashville",
            "coordinates": [
              -86.768,
              36.178
            ]
          },
          "st-louis"
        ]
      },
      {
        "title": "St. Louis → Abilene → Hays",
        "text": "Plains-history day: cattle-town and Eisenhower country.",
        "stopIds": [
          "abilene",
          "hays"
        ],
        "endStopId": "hays",
        "drive": [
          "st-louis",
          "abilene",
          "hays"
        ]
      },
      {
        "title": "Hays → Rockies → Grand Junction",
        "text": "The hardest transit day, crossing Colorado on I‑70; finish at Colorado National Monument.",
        "stopIds": [
          "denver",
          "colorado-monument",
          "grand-junction"
        ],
        "endStopId": "grand-junction",
        "drive": [
          "hays",
          "denver",
          {
            "name": "I-70 Vail",
            "coordinates": [
              -106.376,
              39.642
            ]
          },
          {
            "name": "I-70 Glenwood Springs",
            "coordinates": [
              -107.324,
              39.554
            ]
          },
          {
            "name": "Colorado National Monument west entrance",
            "coordinates": [
              -108.732,
              39.119
            ]
          },
          "colorado-monument",
          {
            "name": "Colorado National Monument west entrance",
            "coordinates": [
              -108.732,
              39.119
            ]
          },
          "grand-junction"
        ]
      },
      {
        "title": "Grand Junction → Fremont Indian State Park → St. George",
        "text": "Fremont archaeology and rock imagery, then descend toward southwestern Utah.",
        "stopIds": [
          "fremont",
          "st-george"
        ],
        "endStopId": "st-george",
        "drive": [
          "grand-junction",
          {
            "name": "I-70 Green River",
            "coordinates": [
              -110.159,
              38.992
            ]
          },
          "fremont",
          "st-george"
        ]
      },
      {
        "title": "St. George → Snow Canyon → Mojave → California",
        "text": "Morning red-rock hike, then I-15 through Nevada. Take a Kelbaker Road detour to Kelso Depot and return to I-15 for Southern California.",
        "stopIds": [
          "snow-canyon",
          "mojave",
          "los-angeles"
        ],
        "endStopId": "los-angeles",
        "drive": [
          "st-george",
          "snow-canyon",
          {
            "name": "I-15 Mesquite",
            "coordinates": [
              -114.07,
              36.81
            ]
          },
          {
            "name": "I-15 Las Vegas",
            "coordinates": [
              -115.184,
              36.145
            ]
          },
          {
            "name": "I-15 Baker",
            "coordinates": [
              -116.073,
              35.266
            ]
          },
          "mojave",
          {
            "name": "I-15 Baker",
            "coordinates": [
              -116.073,
              35.266
            ]
          },
          "los-angeles"
        ]
      }
    ],
    "points": [
      {
        "id": "atlanta",
        "name": "Atlanta",
        "coordinates": [
          -84.388,
          33.749
        ],
        "day": 1,
        "role": "origin"
      },
      {
        "id": "st-louis",
        "name": "St. Louis",
        "coordinates": [
          -90.1994,
          38.627
        ],
        "day": 1,
        "role": "overnight"
      },
      {
        "id": "abilene",
        "name": "Abilene",
        "coordinates": [
          -97.2139,
          38.9172
        ],
        "day": 2,
        "role": "stop"
      },
      {
        "id": "hays",
        "name": "Hays",
        "coordinates": [
          -99.3268,
          38.8792
        ],
        "day": 2,
        "role": "overnight"
      },
      {
        "id": "denver",
        "name": "Denver",
        "coordinates": [
          -104.9903,
          39.7392
        ],
        "day": 3,
        "role": "stop"
      },
      {
        "id": "colorado-monument",
        "name": "Colorado National Monument",
        "coordinates": [
          -108.728,
          39.1009
        ],
        "day": 3,
        "role": "stop",
        "access": "Saddlehorn Visitor Center via the west entrance",
        "source": "https://www.nps.gov/colm/planyourvisit/directions.htm"
      },
      {
        "id": "grand-junction",
        "name": "Grand Junction",
        "coordinates": [
          -108.5506,
          39.0639
        ],
        "day": 3,
        "role": "overnight"
      },
      {
        "id": "fremont",
        "name": "Fremont Indian State Park",
        "coordinates": [
          -112.3341,
          38.5763
        ],
        "day": 4,
        "role": "stop",
        "access": "Museum parking via I-70 exit 17",
        "source": "https://stateparks.utah.gov/parks/fremont-indian/"
      },
      {
        "id": "st-george",
        "name": "St. George",
        "coordinates": [
          -113.5684,
          37.0965
        ],
        "day": 4,
        "role": "overnight"
      },
      {
        "id": "snow-canyon",
        "name": "Snow Canyon",
        "coordinates": [
          -113.6418,
          37.2031
        ],
        "day": 5,
        "role": "stop",
        "access": "State park visitor center",
        "source": "https://stateparks.utah.gov/parks/snow-canyon/"
      },
      {
        "id": "mojave",
        "name": "Mojave National Preserve",
        "coordinates": [
          -115.6534,
          35.0113
        ],
        "day": 5,
        "role": "stop",
        "access": "Kelso Depot via Kelbaker Road; return to I-15",
        "source": "https://www.nps.gov/moja/planyourvisit/directions.htm"
      },
      {
        "id": "los-angeles",
        "name": "Los Angeles",
        "coordinates": [
          -118.2437,
          34.0522
        ],
        "day": 5,
        "role": "destination"
      }
    ],
    "travelMonth": "2026-10",
    "overnightNote": "Overnight markers show provisional areas, not booked lodging. Park access points represent the area until lodging is selected.",
    "seasonNote": "October 2026 planning route. Confirm park access and road conditions before traveling."
  },
  "C": {
    "title": "Northern Parks Diagonal",
    "daysCount": 8,
    "color": "#4e6b87",
    "summary": "A slower northwest diagonal built around genuinely memorable landscapes and major historical sites rather than simply maximizing distance.",
    "scores": {
      "hike": 10,
      "hist": 9,
      "pace": 8
    },
    "why": "This is the strongest route if the road trip itself is the vacation. Ending around Glacier avoids sacrificing the best part of the trip just to add a final high-mileage push to Seattle.",
    "days": [
      {
        "title": "Atlanta → Mammoth Cave",
        "text": "Cave tour plus a surface hike; Indigenous, saltpeter-mining and early guide history.",
        "stopIds": [
          "atlanta",
          "mammoth-cave"
        ],
        "endStopId": "mammoth-cave",
        "drive": [
          "atlanta",
          "mammoth-cave"
        ]
      },
      {
        "title": "Mammoth Cave → St. Joseph / Missouri River",
        "text": "A relocation day toward the western Plains, with frontier / Pony Express context.",
        "stopIds": [
          "st-joseph"
        ],
        "endStopId": "st-joseph",
        "drive": [
          "mammoth-cave",
          {
            "name": "I-64 St. Louis",
            "coordinates": [
              -90.182,
              38.622
            ]
          },
          "st-joseph"
        ]
      },
      {
        "title": "Missouri River → Badlands",
        "text": "Minuteman Missile history followed by the Notch Trail at sunset.",
        "stopIds": [
          "minuteman",
          "badlands"
        ],
        "endStopId": "badlands",
        "drive": [
          "st-joseph",
          {
            "name": "I-29 Sioux Falls",
            "coordinates": [
              -96.78,
              43.579
            ]
          },
          "minuteman",
          {
            "name": "Badlands Notch Trail parking",
            "coordinates": [
              -101.928,
              43.76
            ]
          },
          "badlands"
        ]
      },
      {
        "title": "Badlands → Black Hills → Devils Tower",
        "text": "Visit the Black Hills via Sylvan Lake, then continue through Spearfish to Devils Tower. Use US 16A and SD 89 rather than relying on Needles Highway.",
        "stopIds": [
          "black-hills",
          "devils-tower"
        ],
        "endStopId": "devils-tower",
        "drive": [
          "badlands",
          {
            "name": "Badlands Loop Pinnacles Overlook",
            "coordinates": [
              -102.2337,
              43.8696
            ]
          },
          {
            "name": "I-90 Wall",
            "coordinates": [
              -102.2416,
              43.9925
            ]
          },
          {
            "name": "US 16A Custer",
            "coordinates": [
              -103.599,
              43.767
            ]
          },
          "black-hills",
          {
            "name": "US 16A Custer",
            "coordinates": [
              -103.599,
              43.767
            ]
          },
          {
            "name": "US 385 Deadwood",
            "coordinates": [
              -103.73,
              44.376
            ]
          },
          {
            "name": "I-90 Spearfish",
            "coordinates": [
              -103.856,
              44.495
            ]
          },
          "devils-tower"
        ]
      },
      {
        "title": "Devils Tower → Little Bighorn → Cody",
        "text": "A major historical day across the northern Plains into Wyoming.",
        "stopIds": [
          "little-bighorn",
          "cody"
        ],
        "endStopId": "cody",
        "drive": [
          "devils-tower",
          "little-bighorn",
          {
            "name": "I-90 Laurel",
            "coordinates": [
              -108.771,
              45.667
            ]
          },
          {
            "name": "US 310 Bridger",
            "coordinates": [
              -108.914,
              45.295
            ]
          },
          "cody"
        ]
      },
      {
        "title": "Cody → Yellowstone",
        "text": "Enter via US 14/16/20, visit Old Faithful, and continue via Madison and Norris to Mammoth Hot Springs. Avoid Beartooth Highway and Dunraven Pass; park access is weather dependent.",
        "stopIds": [
          "old-faithful",
          "yellowstone"
        ],
        "endStopId": "yellowstone",
        "drive": [
          "cody",
          {
            "name": "Yellowstone East Entrance",
            "coordinates": [
              -110.004,
              44.489
            ]
          },
          {
            "name": "Fishing Bridge",
            "coordinates": [
              -110.377,
              44.565
            ]
          },
          {
            "name": "West Thumb",
            "coordinates": [
              -110.574,
              44.415
            ]
          },
          "old-faithful",
          {
            "name": "Madison Junction",
            "coordinates": [
              -110.861,
              44.645
            ]
          },
          {
            "name": "Norris Junction",
            "coordinates": [
              -110.694,
              44.736
            ]
          },
          "yellowstone"
        ]
      },
      {
        "title": "Yellowstone → West Glacier",
        "text": "Leave via Gardiner and continue through Livingston, Missoula, and Kalispell to the west side of Glacier.",
        "stopIds": [
          "west-glacier"
        ],
        "endStopId": "west-glacier",
        "drive": [
          "yellowstone",
          {
            "name": "US 89 Gardiner",
            "coordinates": [
              -110.706,
              45.031
            ]
          },
          {
            "name": "I-90 Livingston",
            "coordinates": [
              -110.571,
              45.645
            ]
          },
          {
            "name": "I-90 Missoula",
            "coordinates": [
              -113.993,
              46.888
            ]
          },
          {
            "name": "US 93 Kalispell",
            "coordinates": [
              -114.313,
              48.195
            ]
          },
          "west-glacier"
        ]
      },
      {
        "title": "West Glacier → Lake McDonald → Whitefish",
        "text": "Explore the Lake McDonald valley and choose a lower-elevation hike suited to conditions. Return through West Glacier; no Logan Pass crossing is required.",
        "stopIds": [
          "lake-mcdonald",
          "whitefish"
        ],
        "endStopId": "whitefish",
        "drive": [
          "west-glacier",
          "lake-mcdonald",
          {
            "name": "West Glacier",
            "coordinates": [
              -113.9787,
              48.5008
            ]
          },
          "whitefish"
        ]
      }
    ],
    "points": [
      {
        "id": "atlanta",
        "name": "Atlanta",
        "coordinates": [
          -84.388,
          33.749
        ],
        "day": 1,
        "role": "origin"
      },
      {
        "id": "mammoth-cave",
        "name": "Mammoth Cave",
        "coordinates": [
          -86.1011,
          37.1867
        ],
        "day": 1,
        "role": "overnight",
        "access": "Visitor center represents the overnight area",
        "source": "https://www.nps.gov/maca/planyourvisit/directions.htm"
      },
      {
        "id": "st-joseph",
        "name": "St. Joseph",
        "coordinates": [
          -94.8467,
          39.7675
        ],
        "day": 2,
        "role": "overnight"
      },
      {
        "id": "minuteman",
        "name": "Minuteman Missile",
        "coordinates": [
          -101.9038,
          43.9313
        ],
        "day": 3,
        "role": "stop",
        "access": "Visitor center at I-90 exit 131",
        "source": "https://www.nps.gov/mimi/planyourvisit/directions.htm"
      },
      {
        "id": "badlands",
        "name": "Badlands",
        "coordinates": [
          -101.9418,
          43.7497
        ],
        "day": 3,
        "role": "overnight",
        "access": "Ben Reifel Visitor Center represents the overnight area",
        "source": "https://www.nps.gov/badl/planyourvisit/directions.htm"
      },
      {
        "id": "black-hills",
        "name": "Black Hills",
        "coordinates": [
          -103.5639,
          43.8465
        ],
        "day": 4,
        "role": "stop",
        "access": "Sylvan Lake parking via US 16A and SD 89; no Needles Highway requirement",
        "source": "https://gfp.sd.gov/parks/detail/custer-state-park/"
      },
      {
        "id": "devils-tower",
        "name": "Devils Tower",
        "coordinates": [
          -104.7154,
          44.5905
        ],
        "day": 4,
        "role": "overnight",
        "access": "Visitor center represents the overnight area",
        "source": "https://www.nps.gov/deto/planyourvisit/directions.htm"
      },
      {
        "id": "little-bighorn",
        "name": "Little Bighorn",
        "coordinates": [
          -107.4281,
          45.57
        ],
        "day": 5,
        "role": "stop",
        "access": "Visitor parking via I-90 exit 510",
        "source": "https://www.nps.gov/libi/planyourvisit/directions.htm"
      },
      {
        "id": "cody",
        "name": "Cody",
        "coordinates": [
          -109.0565,
          44.5263
        ],
        "day": 5,
        "role": "overnight"
      },
      {
        "id": "old-faithful",
        "name": "Old Faithful",
        "coordinates": [
          -110.8297,
          44.4597
        ],
        "day": 6,
        "role": "stop",
        "access": "Visitor parking via Yellowstone East Entrance and West Thumb",
        "source": "https://www.nps.gov/yell/planyourvisit/parkroads.htm"
      },
      {
        "id": "yellowstone",
        "name": "Yellowstone",
        "coordinates": [
          -110.7018,
          44.9763
        ],
        "day": 6,
        "role": "overnight",
        "access": "Mammoth Hot Springs represents the overnight area; lodging is not fixed",
        "source": "https://www.nps.gov/yell/planyourvisit/parkroads.htm"
      },
      {
        "id": "west-glacier",
        "name": "West Glacier",
        "coordinates": [
          -113.9787,
          48.5008
        ],
        "day": 7,
        "role": "overnight"
      },
      {
        "id": "lake-mcdonald",
        "name": "Lake McDonald",
        "coordinates": [
          -113.8727,
          48.6179
        ],
        "day": 8,
        "role": "stop",
        "access": "Lake McDonald Lodge road access; no Logan Pass crossing",
        "source": "https://www.nps.gov/places/gtsr-west-side-winter-closure.htm"
      },
      {
        "id": "whitefish",
        "name": "Whitefish",
        "coordinates": [
          -114.3353,
          48.4106
        ],
        "day": 8,
        "role": "destination"
      }
    ],
    "travelMonth": "2026-10",
    "overnightNote": "Overnight markers show provisional areas, not booked lodging. Park access points represent the area until lodging is selected.",
    "seasonNote": "October plan: avoid Beartooth Highway, Dunraven Pass, and Logan Pass. Yellowstone and Glacier access remains weather dependent."
  }
};
