export interface Product {
  id: string;
  name: string;
  banner_image: string;
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
