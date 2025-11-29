// Countries and Cities Data
export interface CountryCity {
  country: string;
  cities: string[];
}

export const countriesWithCities: CountryCity[] = [
  {
    country: "Ethiopia",
    cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Awassa", "Bahir Dar", "Dessie", "Jimma", "Jijiga", "Shashamane"],
  },
  {
    country: "Kenya",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega"],
  },
  {
    country: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  },
  {
    country: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol", "Cardiff", "Belfast"],
  },
  {
    country: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Victoria"],
  },
  {
    country: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
  },
  {
    country: "France",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
  },
  {
    country: "Italy",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania"],
  },
  {
    country: "Spain",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"],
  },
  {
    country: "China",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Xi'an", "Hangzhou", "Wuhan", "Nanjing", "Tianjin"],
  },
  {
    country: "India",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"],
  },
  {
    country: "Japan",
    cities: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Kyoto", "Saitama"],
  },
  {
    country: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Sunshine Coast", "Wollongong"],
  },
  {
    country: "Brazil",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
  },
  {
    country: "South Africa",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Polokwane", "Nelspruit", "Kimberley"],
  },
  {
    country: "Nigeria",
    cities: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Kaduna", "Maiduguri", "Zaria", "Aba"],
  },
  {
    country: "Egypt",
    cities: ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Aswan", "Asyut", "Ismailia"],
  },
  {
    country: "Ghana",
    cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Ashaiman", "Sunyani", "Cape Coast", "Obuasi", "Teshie", "Tema"],
  },
  {
    country: "Tanzania",
    cities: ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Zanzibar City", "Kigoma", "Mtwara"],
  },
  {
    country: "Uganda",
    cities: ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Mbale", "Mukono", "Masaka", "Entebbe", "Arua"],
  },
];

// Helper function to get countries list
export const getCountries = (): string[] => {
  return countriesWithCities.map((item) => item.country).sort();
};

// Helper function to get cities for a specific country
export const getCitiesByCountry = (country: string): string[] => {
  const countryData = countriesWithCities.find(
    (item) => item.country === country
  );
  return countryData ? countryData.cities : [];
};

// Country-city mapping for easy lookup
export const countryCityMap: Record<string, string[]> = 
  countriesWithCities.reduce((acc, item) => {
    acc[item.country] = item.cities;
    return acc;
  }, {} as Record<string, string[]>);

