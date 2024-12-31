export interface SpecificationItem {
  name: string;
  quantity: number;
  unit: string;
  priceWithVAT?: number;
  priceWithoutVAT?: number;
  totalWithVAT?: number;
  totalWithoutVAT?: number;
  category?: string;
}

export interface SpecificationProps {
  kekv: string;
  onSpecificationsLoaded: (specifications: SpecificationItem[]) => void;
}

export interface RendererProps {
  specifications: SpecificationItem[];
  loading?: boolean;
  error?: string;
}
