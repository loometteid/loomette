export interface LibraryBasicItem {
  id: string;
  name: string;
  category: "Tops" | "Bottoms" | "Shoes" | "Accessories";
  subcategory: string;
}

export const LIBRARY_BASICS: LibraryBasicItem[] = [
  { id: "basic-1", name: "White Crew Tee", category: "Tops", subcategory: "Shirt" },
  { id: "basic-2", name: "Black Tailored Blazer", category: "Tops", subcategory: "Shirt" },
  { id: "basic-3", name: "Classic Button-Down", category: "Tops", subcategory: "Shirt" },
  { id: "basic-4", name: "Knit Pullover", category: "Tops", subcategory: "Polo" },
  { id: "basic-5", name: "Relaxed Striped Shirt", category: "Tops", subcategory: "Shirt" },
  { id: "basic-6", name: "Straight Indigo Jeans", category: "Bottoms", subcategory: "Jeans" },
  { id: "basic-7", name: "Wide-Leg Trousers", category: "Bottoms", subcategory: "Pants" },
  { id: "basic-8", name: "Black Slim Pants", category: "Bottoms", subcategory: "Pants" },
  { id: "basic-9", name: "A-Line Midi Skirt", category: "Bottoms", subcategory: "Skirt" },
  { id: "basic-10", name: "Denim Cutoffs", category: "Bottoms", subcategory: "Jeans" },
  { id: "basic-11", name: "Low-Top White Sneakers", category: "Shoes", subcategory: "Sneakers" },
  { id: "basic-12", name: "Classic Leather Loafers", category: "Shoes", subcategory: "Heels" },
  { id: "basic-13", name: "Minimalist Slide Sandals", category: "Shoes", subcategory: "Sandals" },
  { id: "basic-14", name: "Structured Canvas Tote", category: "Accessories", subcategory: "Bag" },
  { id: "basic-15", name: "Everyday Leather Belt", category: "Accessories", subcategory: "Belt" },
];
