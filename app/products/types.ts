export interface Product {
  id: string;
  name: string;
  banner_image: string | null; // Now can be null and contains Cloudinary URL
  is_veg: boolean;
  price: number;
  categories:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
}
