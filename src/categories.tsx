import {
  ForkKnife,
  Car,
  House,
  FilmSlate,
  Heartbeat,
  ShoppingBag,
  Lightning,
  DotsThreeCircle,
  type Icon,
} from "@phosphor-icons/react";

export interface CategoryDef {
  name: string;
  icon: Icon;
}

export const CATEGORIES: CategoryDef[] = [
  { name: "Food", icon: ForkKnife },
  { name: "Transport", icon: Car },
  { name: "Housing", icon: House },
  { name: "Entertainment", icon: FilmSlate },
  { name: "Health", icon: Heartbeat },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Utilities", icon: Lightning },
  { name: "Other", icon: DotsThreeCircle },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
