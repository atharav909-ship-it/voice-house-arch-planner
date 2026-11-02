import os
import json
import re
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Indian cities microclimate lookup for high accuracy
CITY_CLIMATE_MAP = {
    "pune": {"climate": "Semi-Arid / Moderate Plateau", "zone": "Temperate Warm", "wind": "South-West prevailing summer breezes"},
    "ahmedabad": {"climate": "Hot & Dry", "zone": "Arid Hot", "wind": "South-West to West"},
    "mumbai": {"climate": "Warm & Humid", "zone": "Coastal Maritime", "wind": "North-West to South-West sea breeze"},
    "chennai": {"climate": "Warm & Humid", "zone": "Coastal Maritime", "wind": "South-East sea breeze"},
    "bengaluru": {"climate": "Moderate / Temperate", "zone": "Highland Moderate", "wind": "West-Southwest"},
    "bangalore": {"climate": "Moderate / Temperate", "zone": "Highland Moderate", "wind": "West-Southwest"},
    "delhi": {"climate": "Composite / Extreme Continental", "zone": "Composite", "wind": "North-West in winter, East-Southeast in monsoon"},
    "jaipur": {"climate": "Hot & Dry", "zone": "Arid Hot", "wind": "North-West to South-West"},
    "hyderabad": {"climate": "Semi-Arid / Hot & Dry", "zone": "Deccan Plateau", "wind": "South-East to South-West"},
    "kolkata": {"climate": "Warm & Humid", "zone": "Deltaic Humid", "wind": "South-Southwest"}
}

def clean_json_string(raw: str) -> str:
    """Strip markdown codeblocks and extraneous chatter to get pure JSON."""
    raw = raw.strip()
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw, re.DOTALL)
    if match:
        return match.group(1)
    # If no backticks, find outermost braces
    start = raw.find('{')
    end = raw.rfind('}')
    if start != -1 and end != -1:
        return raw[start:end+1]
    return raw

def generate_architectural_layout(
    transcript: str,
    overrides: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Analyzes architectural transcript using Sarvam AI (sarvam-105b-conversations)
    and produces a complete bioclimatic layout plan.
    """
    api_key = os.getenv("SARVAM_API_KEY")
    overrides = overrides or {}

    prompt = f"""You are a licensed senior architect specializing in bioclimatic and Indian residential design (NBC & Vastu compliant).
Analyze the client's voice transcript and any override parameters to design a complete house layout.

Client Transcript:
"{transcript.strip() or '30x40 north-facing plot in Pune, middle-class budget, G+1 duplex with L-shaped couch, TV console, ottoman, floor vase, and 6-seater dining table'}"

Overrides (if any):
{json.dumps(overrides, indent=2)}

You must return a SINGLE valid JSON object with EXACTLY this structure (no markdown fences, no explanatory text outside JSON):
{{
  "project_title": "string (e.g. 'Bioclimatic 30x40 North-Facing Duplex')",
  "extracted_parameters": {{
    "city": "string (e.g. 'Pune')",
    "micro_climate": "string (e.g. 'Hot & Semi-Arid / Moderate Plateau')",
    "plot_dimensions": "string (e.g. '30 ft x 40 ft')",
    "plot_area_sqft": 1200,
    "plot_facing": "string (e.g. 'North', 'South', 'East', 'West')",
    "floors": "string (e.g. 'G+1 Duplex')",
    "budget_tier": "string (Cost-Efficient, Middle-Class, or Luxury)",
    "custom_fixtures": ["list", "of", "all", "detected", "fixtures"]
  }},
  "climate_passive_strategy": {{
    "sun_path_strategy": "string detailing solar angle, north glare-free light, south/west shading",
    "wind_cross_ventilation": "string detailing prevailing breezes, stack effect, double-height court or staircase",
    "window_placement": "string detailing window sizing, sill levels, and facade orientation",
    "shading_and_materials": "string detailing chajjas, overhang depth, cavity walls, cool roof, thermal mass"
  }},
  "floors_schedule": [
    {{
      "floor_name": "Ground Floor",
      "total_area_sqft": 850,
      "rooms": [
        {{
          "name": "Room Name",
          "dimensions": "W'D\" x L'D\"",
          "area_sqft": 200,
          "aspect": "North / South / East / West",
          "ventilation": "Ventilation & glazing specification"
        }}
      ]
    }}
  ],
  "furniture_layout": [
    {{
      "room": "Room Name",
      "floor": "Ground Floor",
      "dimensions": "W'D\" x L'D\"",
      "furnishings": [
        {{
          "item": "Item Name",
          "placement": "Exact wall anchoring and orientation",
          "clearance": "Clearance corridor (e.g. 3.5 ft to walkway, 10.5 ft viewing distance)"
        }}
      ],
      "circulation_notes": "Corridor width and clear 3-foot movement lines"
    }}
  ],
  "ascii_floor_plan": "string containing a clean 2D ASCII architectural floor plan with walls (+ - |), doorways (D), windows (W), and labeled rooms",
  "schematic_2d": {{
    "plot_width_ft": 30,
    "plot_depth_ft": 40,
    "rooms": [
      {{
        "id": "living",
        "floor": "Ground Floor",
        "name": "Living Room",
        "x": 2,
        "y": 4,
        "w": 14,
        "h": 16,
        "color": "#3b82f6",
        "furniture": ["L-Couch", "TV Unit", "Ottoman"]
      }}
    ]
  }}
}}

Important Architectural Rules:
1. Ensure 3-foot minimum circulation corridors in all rooms and between furnishings.
2. Align kitchen to South-East (Agni) or North-West. Master Bedroom to South-West for thermal stability and privacy.
3. Incorporate all user-requested custom fixtures explicitly.
"""

    if api_key:
        try:
            from sarvamai import SarvamAI
            client = SarvamAI(api_subscription_key=api_key)
            response = client.chat.completions(
                model="sarvam-105b-conversations",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            raw_text = response.choices[0].message.content
            cleaned = clean_json_string(raw_text)
            data = json.loads(cleaned)
            return data
        except Exception as e:
            print(f"[LayoutEngine] Sarvam AI generation error: {e}. Falling back to rule-based engine.")

    # Rule-based fallback generator
    return generate_fallback_layout(transcript, overrides)

def generate_fallback_layout(transcript: str, overrides: Dict[str, Any]) -> Dict[str, Any]:
    """Deterministic, NBC-standard architectural fallback engine."""
    text = (transcript + " " + json.dumps(overrides)).lower()

    # Detect city
    city = "Pune"
    for c in CITY_CLIMATE_MAP.keys():
        if c in text:
            city = c.capitalize()
            break
    
    climate_info = CITY_CLIMATE_MAP.get(city.lower(), CITY_CLIMATE_MAP["pune"])

    # Facing
    facing = "North"
    for f in ["north", "south", "east", "west", "north-east", "north-west"]:
        if f in text:
            facing = f.capitalize()
            break

    # Budget
    budget = "Middle-Class"
    if "luxury" in text or "premium" in text:
        budget = "Luxury"
    elif "cost-efficient" in text or "budget" in text or "economical" in text:
        budget = "Cost-Efficient"

    # Dimensions
    dim_match = re.search(r'(\d{2})\s*[xX*by\s]+\s*(\d{2})', text)
    if dim_match:
        w_ft = int(dim_match.group(1))
        d_ft = int(dim_match.group(2))
    else:
        w_ft, d_ft = 30, 40
    
    plot_dim_str = f"{w_ft} ft x {d_ft} ft"
    plot_sqft = w_ft * d_ft

    # Custom fixtures
    fixtures = []
    fixture_keywords = [
        "l-shaped couch", "l-shaped sofa", "tv console", "tv unit", "ottoman",
        "floor vase", "6-seater dining table", "dining table", "island counter",
        "bar stools", "king bed", "queen bed", "study nook", "walk-in wardrobe",
        "pooja unit", "shoe rack"
    ]
    for kw in fixture_keywords:
        if kw in text:
            fixtures.append(kw.title())
    if not fixtures:
        fixtures = ["L-Shaped Couch", "TV Console", "Ottoman", "Floor Vase", "6-Seater Dining Table"]

    # ASCII Floor Plan
    ascii_plan = f"""
+=============================================+
| [N] FRONT SETBACK / PARKING (3.0m x 4.5m)   |
|   Entrance Gate ====>                       |
+---------------------+-----------------------+
| FOYER (1.8m x 2.4m) | LIVING ROOM           |
| [D] Door            | (4.2m x 5.0m)         |
|                     | [L-Couch anchored]    |
|                     | [TV Unit on East wall]|
|                     | [Ottoman + Vase]      |
+---------------------+-----------------------+
| STAIRCASE / COURT   | DINING (3.3m x 4.0m)  |
| Stack Ventilation   | [6-Seater Table]      |
| Light-well Shaft    +-----------------------+
|                     | OPEN KITCHEN          |
|                     | (3.0m x 3.2m) [SE]    |
+---------------------+-----------------------+
| GUEST BED (3.6m x 3.6m) | COMMON BATH       |
| [NW Corner]             | (1.5m x 2.4m)     |
+=============================================+
"""

    return {
        "project_title": f"Bioclimatic {plot_dim_str} {facing}-Facing Residential Layout",
        "extracted_parameters": {
            "city": city,
            "micro_climate": climate_info["climate"],
            "plot_dimensions": plot_dim_str,
            "plot_area_sqft": plot_sqft,
            "plot_facing": facing,
            "floors": "G+1 Duplex",
            "budget_tier": budget,
            "custom_fixtures": fixtures
        },
        "climate_passive_strategy": {
            "sun_path_strategy": f"The {facing}-facing facade provides soft, glare-free daylight throughout the day. South and West walls are insulated with 230mm brick masonry and shaded overhangs to block harsh afternoon solar radiation.",
            "wind_cross_ventilation": f"Captures {climate_info['wind']} via strategically placed operable casement windows, drawing air through the living-dining axis into an internal double-height stack ventilation atrium.",
            "window_placement": "Large double-glazed low-E windows oriented to North and East. High-level clerestory louvers on West to exhaust rising hot air.",
            "shading_and_materials": "Deep 1.0m (3.3 ft) RCC cantilever chajjas over all exposed apertures, lime-plaster exterior finish, and reflective cool-roof coatings."
        },
        "floors_schedule": [
            {
                "floor_name": "Ground Floor",
                "total_area_sqft": int(plot_sqft * 0.72),
                "rooms": [
                    {"name": "Covered Verandah & Parking", "dimensions": "10'0\" x 15'0\"", "area_sqft": 150, "aspect": facing, "ventilation": "Open exterior buffer"},
                    {"name": "Entrance Foyer", "dimensions": "6'0\" x 8'0\"", "area_sqft": 48, "aspect": facing, "ventilation": "Louvered security grille"},
                    {"name": "Formal Living Room", "dimensions": "14'0\" x 16'6\"", "area_sqft": 231, "aspect": f"{facing}-East", "ventilation": "Bay window + cross-slit aperture"},
                    {"name": "Dining Hall", "dimensions": "11'0\" x 13'6\"", "area_sqft": 148, "aspect": "East", "ventilation": "French doors opening to courtyard lightwell"},
                    {"name": "Vastu Modular Kitchen", "dimensions": "10'0\" x 10'6\"", "area_sqft": 105, "aspect": "South-East (Agni Corner)", "ventilation": "Dedicated high-volume chimney duct & corner window"},
                    {"name": "Ground Guest Bedroom", "dimensions": "12'0\" x 12'0\"", "area_sqft": 144, "aspect": "North-West", "ventilation": "Casement glazed window with fly mesh"},
                    {"name": "Common Bath & Powder Room", "dimensions": "5'0\" x 8'0\"", "area_sqft": 40, "aspect": "West", "ventilation": "High-level frosted louvers"}
                ]
            },
            {
                "floor_name": "First Floor",
                "total_area_sqft": int(plot_sqft * 0.65),
                "rooms": [
                    {"name": "Master Suite with Walk-In Wardrobe", "dimensions": "14'0\" x 15'6\"", "area_sqft": 217, "aspect": "South-West (Thermal Stability)", "ventilation": "Shaded deep private balcony"},
                    {"name": "En-Suite Master Bathroom", "dimensions": "8'0\" x 9'0\"", "area_sqft": 72, "aspect": "West", "ventilation": "Mechanical exhaust + glass block daylight panel"},
                    {"name": "Children's Bedroom", "dimensions": "12'0\" x 13'0\"", "area_sqft": 156, "aspect": "North-East", "ventilation": "Corner window for morning sun"},
                    {"name": "Family Lounge & Study Nook", "dimensions": "12'0\" x 14'0\"", "area_sqft": 168, "aspect": "Internal Void", "ventilation": "Overlooks green courtyard skylight"},
                    {"name": "Open Green Terrace", "dimensions": "10'0\" x 14'0\"", "area_sqft": 140, "aspect": facing, "ventilation": "Open pergola with bougainvillea shade"}
                ]
            }
        ],
        "furniture_layout": [
            {
                "room": "Formal Living Room",
                "floor": "Ground Floor",
                "dimensions": "14'0\" x 16'6\"",
                "furnishings": [
                    {"item": "L-shaped Sectional Couch (8'6\" x 6'0\")", "placement": "Anchored flush against West structural masonry wall facing North-East", "clearance": "3.8 ft primary circulation corridor to entry foyer"},
                    {"item": "Low-Profile Wall-Mounted TV Console (6'0\" width)", "placement": "Mounted on East feature fluted panel wall with concealed conduits", "clearance": "Viewing distance calibrated to 10.5 ft for optimal eye comfort"},
                    {"item": "Upholstered Ottoman & Round Coffee Table", "placement": "Positioned at interior axis of sectional couch", "clearance": "3.0 ft loop clearance surrounding couch perimeter"},
                    {"item": "Handcrafted Ceramic Floor Vase", "placement": "Recessed in North-East illuminated corner niche", "clearance": "Zero intrusion on primary walking corridor"}
                ],
                "circulation_notes": "Main entry path to staircase and dining features an unimpeded 3'6\" direct architectural thoroughfare."
            },
            {
                "room": "Dining Hall",
                "floor": "Ground Floor",
                "dimensions": "11'0\" x 13'6\"",
                "furnishings": [
                    {"item": "6-Seater Solid Teak Dining Table (6'0\" x 3'6\")", "placement": "Centrally placed along north-south axis beneath ambient pendant luminaire", "clearance": "3.5 ft pull-out clearance on all sides to adjacent walls and island"},
                    {"item": "Recessed Crockery Credenza / Sideboard", "placement": "Built into South architectural wall alcove", "clearance": "3.2 ft passage clearance when dining chairs are occupied"}
                ],
                "circulation_notes": "Seamless open-plan 4'0\" transition corridor connecting dining area directly to the modular kitchen."
            },
            {
                "room": "Master Suite",
                "floor": "First Floor",
                "dimensions": "14'0\" x 15'6\"",
                "furnishings": [
                    {"item": "King Size Bed (6'6\" x 6'6\") with Upholstered Headboard", "placement": "Centered on South wall with nightstands flanking both sides", "clearance": "3.5 ft clear walking space on both sides and foot of bed"},
                    {"item": "Corner Study Nook / Workstation", "placement": "Tucked beside North-East glazed opening for task lighting", "clearance": "3.0 ft chair pushback clearance"}
                ],
                "circulation_notes": "Direct 3'6\" pathway towards walk-in wardrobe and en-suite master bath."
            }
        ],
        "ascii_floor_plan": ascii_plan,
        "schematic_2d": {
            "plot_width_ft": w_ft,
            "plot_depth_ft": d_ft,
            "rooms": [
                {"id": "verandah", "floor": "Ground Floor", "name": "Parking / Verandah", "x": 0, "y": 0, "w": 12, "h": 12, "color": "#64748b", "furniture": ["Portico", "Shoe Rack"]},
                {"id": "foyer", "floor": "Ground Floor", "name": "Foyer", "x": 12, "y": 0, "w": 6, "h": 10, "color": "#0ea5e9", "furniture": ["Console", "Key Nook"]},
                {"id": "living", "floor": "Ground Floor", "name": "Living Room", "x": 0, "y": 12, "w": 16, "h": 18, "color": "#3b82f6", "furniture": ["L-Couch", "TV Console", "Ottoman", "Floor Vase"]},
                {"id": "dining", "floor": "Ground Floor", "name": "Dining Area", "x": 16, "y": 12, "w": 14, "h": 12, "color": "#10b981", "furniture": ["6-Seater Table", "Sideboard"]},
                {"id": "kitchen", "floor": "Ground Floor", "name": "Kitchen (SE)", "x": 16, "y": 24, "w": 14, "h": 16, "color": "#f59e0b", "furniture": ["Hob", "Sink", "Pantry"]},
                {"id": "guest_bed", "floor": "Ground Floor", "name": "Guest Bedroom", "x": 0, "y": 30, "w": 16, "h": 10, "color": "#8b5cf6", "furniture": ["Queen Bed", "Wardrobe"]},
                {"id": "bath", "floor": "Ground Floor", "name": "Bath & Powder", "x": 16, "y": 0, "w": 14, "h": 12, "color": "#ec4899", "furniture": ["Vanity", "WC", "Shower"]}
            ]
        }
    }
