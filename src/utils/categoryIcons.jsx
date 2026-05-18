import {
  UtensilsCrossed, Coffee, ShoppingCart, HeartPulse, Pill, BedDouble,
  Cake, Scissors, Dumbbell, Wrench, Smartphone, Shirt, Wind, BookOpen,
  Building2, Store, Settings,
} from "lucide-react";

export const CATEGORY_ICON_MAP = {
  Restaurant:  UtensilsCrossed,
  Cafe:        Coffee,
  Grocery:     ShoppingCart,
  Hospital:    HeartPulse,
  Pharmacy:    Pill,
  Hotel:       BedDouble,
  Bakery:      Cake,
  Salon:       Scissors,
  Gym:         Dumbbell,
  Hardware:    Wrench,
  Electronics: Smartphone,
  Clothing:    Shirt,
  Laundry:     Wind,
  Repair:      Settings,
  Education:   BookOpen,
  Services:    Store,
  Other:       Building2,
};

export function CategoryIcon({ category, size = 20, className = "" }) {
  const Icon = CATEGORY_ICON_MAP[category] || Building2;
  return <Icon size={size} className={className} />;
}
