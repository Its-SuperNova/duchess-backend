import { supabase } from "./supabase";
import coimbatorePincodes from "./Coimbatore_District_Pincode.json";
import { calculateDistanceAndTime } from "./osrm-routing";

// Coimbatore pincodes and their corresponding areas
const COIMBATORE_PINCODES: { [key: string]: string } = {
  "641001": "Coimbatore H.O.",
  "641002": "R S Puram",
  "641003": "Lawley Road",
  "641004": "Peelamedu",
  "641005": "Singanallur",
  "641006": "Ganapathy",
  "641007": "Veera Keralam",
  "641008": "Kuniamuthur",
  "641009": "Ram Nagar",
  "641010": "Perur",
  "641011": "Saibaba Colony",
  "641012": "Gandhipuram",
  "641013": "Govt College of Technology",
  "641014": "Civil Aerodrome",
  "641015": "Uppilipalayam",
  "641016": "Ondipudur",
  "641017": "Vadamadurai",
  "641018": "Coimbatore Central",
  "641019": "Press Colony",
  "641020": "Perianaickenpalayam",
  "641021": "Industrial Estate",
  "641022": "NGGO Colony",
  "641023": "Podanur",
  "641024": "Sundrapuram",
  "641025": "Velandipalayam",
  "641026": "Selvapuram",
  "641027": "Rathnapuri",
  "641028": "Sowripalayam",
  "641029": "Gananambika Mills",
  "641030": "Kavundampalayam",
  "641031": "Narasimhanaickenpalayam",
  "641032": "Othakalmandapam",
  "641033": "Neelikonampalayam",
  "641034": "Thudialur",
  "641035": "Saravanampatti",
  "641036": "Nanjundapuram",
  "641037": "Pappanaickenpalayam",
  "641038": "Kuppakonampudur",
  "641039": "Telengupalayam",
  "641040": "Subramaniampuram",
  "641041": "Vadavalli",
  "641042": "Kovaipudur",
  "641043": "Avinashilingam College area",
  "641044": "Siddhapudur",
  "641045": "Ramanathapuram",
  "641046": "Bharathiyar University",
  "641047": "Jothipuram",
  "641048": "Coimbatore West (Kalapatti)",
  "641049": "Coimbatore East (Chinnavedampatti)",
  "641050": "Malumichampatti",
  "641062": "Chinniampalayam",
  "641101": "Alandurai",
  "641102": "Athikadvu",
  "641103": "Irugur",
  "641104": "Karamadai",
  "641105": "Madukkarai",
  "641106": "Pillur Dam",
  "641107": "Sarkar Samakulam",
  "641108": "Thadagam",
  "641109": "Thondamuthur",
  "641110": "Vaiyampalayam",
  "641111": "Vellalore",
  "641112": "Amritanagar",
  "641113": "Seeliyur",
  "641114": "Nallur Vayal",
  "641201": "Chettipalayam",
  "641202": "Vadasitham",
  "641301": "Mettupalayam H.O",
  "641302": "Sirumugai",
  "641305": "Mahadevapuram",
  "641401": "Kangayampalayam",
  "641402": "Sulur",
  "641403": "Ravathur",
  "641405": "Kannampalayam",
  "641406": "Muthugoundenpudur",
  "641407": "Arasur",
  "641408": "Appanaickenpatti (near Sulur)",
  "641601": "Tiruppur H.O",
  "641602": "Tiruppur North",
  "641603": "Gandhinagar (Tiruppur)",
  "641604": "Tiruppur Cotton Market",
  "641605": "Veerapandi (Tiruppur)",
  "641606": "Vijayapuram (Tiruppur)",
  "641607": "Tiruppur East",
  "641608": "KNP Colony (Tiruppur)",
  "641652": "Anupparpalayam",
  "641653": "Annur",
  "641654": "Avinashi",
  "641655": "Cheyur",
  "641658": "Karadibavi",
  "641659": "Karumattampatti",
  "641662": "Kuppuswaminaidupuram",
  "641663": "Mangalam",
  "641664": "Palladam",
  "641665": "Pallikalipalayam",
  "641666": "Perumanallur",
  "641667": "Pongalur",
  "641668": "Somanur",
  "641669": "Sultanpet",
  "641670": "Karavalur",
  "641671": "Katanur",
  "641687": "Iruvampalayam",
  "641697": "Pogalur",
  "642001": "Pollachi H.O.",
  "642002": "Achipatti",
  "642004": "Akilandapuram",
  "642005": "Devambadi",
  "642007": "Angalakurichi",
  "642101": "Aliyar Nagar",
  "642102": "Amaravathi Nagar",
  "642103": "Ambarampalayam",
  "642104": "Anaimalai",
  "642106": "Cinchona",
  "642107": "Kolarpatti",
  "642108": "Paralai",
  "642109": "Kothavadi",
  "642110": "Alagirichettipalayam",
  "642111": "Agrahara Kannadiputhur",
  "642112": "Dhully",
  "642113": "Madathukulam",
  "642114": "Malayandipattinam",
  "642120": "Chinna Negamam",
  "642123": "Samathur",
  "642125": "Sheikalmudi",
  "642126": "Eripalayam",
  "642127": "Akkamalai",
  "642129": "Odayakulam",
  "642132": "Deepalapatti",
  "642134": "Pethanaickanur",
  "642154": "Andigoundanur",
  "642202": "Dasanaicken Palayam",
  "642203": "Kaniyur",
  "642205": "Nagore (Pollachi)",
  "642207": "Chellappampalayam",
  "638459": "Muduthurai (Coimbatore District)",
  "638461": "Doddapura",
  "638462": "Kuttagam",
  "641262": "Vadasitham",
};

export interface AddressValidationInput {
  city?: string;
  state?: string;
  zip_code: string;
}

export interface ValidationResult {
  isCoimbatoreArea: boolean;
  error?: string;
  distance?: number;
  duration?: number;
  area?: string;
}

export interface PincodeAutofillResult {
  isValid: boolean;
  area?: string;
  city: string;
  state: string;
  distance?: number;
  duration?: number;
  error?: string;
}

// Function to get area name from pincode
export function getAreaFromPincode(pincode: string): string | null {
  return coimbatorePincodes[pincode as keyof typeof coimbatorePincodes] || null;
}

// Function to check if pincode is valid for Coimbatore
export function isValidCoimbatorePincode(pincode: string): boolean {
  return pincode in coimbatorePincodes;
}

// Function to autofill address details based on pincode
export async function autofillAddressFromPincode(
  pincode: string
): Promise<PincodeAutofillResult> {
  try {
    // Clean pincode (remove spaces, special characters)
    const cleanPincode = pincode.replace(/\s+/g, "").trim();

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        isValid: false,
        city: "",
        state: "",
        error: "Please enter a valid 6-digit pincode.",
      };
    }

    // Check if pincode exists in Coimbatore district
    const area = getAreaFromPincode(cleanPincode);

    if (!area) {
      return {
        isValid: false,
        city: "",
        state: "",
        error:
          "This pincode is not serviceable. We currently deliver only in Coimbatore district.",
      };
    }

    // Calculate distance and duration using OSRM routing
    const routingResult = await calculateDistanceAndTime(area, cleanPincode);

    return {
      isValid: true,
      area: area,
      city: "Coimbatore",
      state: "Tamil Nadu",
      distance: routingResult.success ? routingResult.distance : 5, // Fallback to 5km if routing fails
      duration: routingResult.success ? routingResult.duration : 30, // Fallback to 30min if routing fails
    };
  } catch (error) {
    console.error("Error in autofillAddressFromPincode:", error);
    return {
      isValid: false,
      city: "",
      state: "",
      error: "Failed to validate pincode. Please try again.",
    };
  }
}

// Function to validate if an address is within Coimbatore delivery area
export async function validateAddressForCoimbatoreDelivery(
  address: AddressValidationInput
): Promise<ValidationResult> {
  try {
    // Clean pincode
    const cleanPincode = address.zip_code.replace(/\s+/g, "").trim();

    // Validate pincode format
    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        isCoimbatoreArea: false,
        error: "Please enter a valid 6-digit pincode.",
      };
    }

    // Check if pincode exists in Coimbatore district
    const area = getAreaFromPincode(cleanPincode);

    if (!area) {
      return {
        isCoimbatoreArea: false,
        error:
          "This pincode is not in our delivery area. We currently deliver only within Coimbatore district.",
      };
    }

    // If city and state are provided, validate them
    if (address.city && !address.city.toLowerCase().includes("coimbatore")) {
      return {
        isCoimbatoreArea: false,
        error: "City should be Coimbatore for this pincode.",
      };
    }

    if (address.state && !address.state.toLowerCase().includes("tamil nadu")) {
      return {
        isCoimbatoreArea: false,
        error: "State should be Tamil Nadu for this pincode.",
      };
    }

    // Calculate distance and duration using OSRM routing
    const routingResult = await calculateDistanceAndTime(area, cleanPincode);

    return {
      isCoimbatoreArea: true,
      area: area,
      distance: routingResult.success ? routingResult.distance : 5, // Fallback to 5km if routing fails
      duration: routingResult.success ? routingResult.duration : 30, // Fallback to 30min if routing fails
    };
  } catch (error) {
    console.error("Error in validateAddressForCoimbatoreDelivery:", error);
    return {
      isCoimbatoreArea: false,
      error: "Failed to validate address. Please try again.",
    };
  }
}

// Function to get all available pincodes (for dropdown or search)
export function getAllCoimbatorePincodes(): Array<{
  pincode: string;
  area: string;
}> {
  return Object.entries(coimbatorePincodes).map(([pincode, area]) => ({
    pincode,
    area,
  }));
}

// Function to search pincodes by area name
export function searchPincodesByArea(
  searchTerm: string
): Array<{ pincode: string; area: string }> {
  const allPincodes = getAllCoimbatorePincodes();
  const searchLower = searchTerm.toLowerCase();

  return allPincodes.filter(({ area }) =>
    area.toLowerCase().includes(searchLower)
  );
}
