export type OrderItem = {
  id: string;
  quantity: number;
  observations: string;
  product: {
    id: string;
    name: string;
    price: number;
    tax: string;
  };
};

export type Order = {
  id: string;
  createdAt: string;
  tableId: string;
  orderProduct: OrderItem[];
  status: string;
  deleted: boolean;
  hidden: boolean;
  showError: boolean;
  anulled: boolean;
  delivered: boolean;
  userId: string | undefined;
};
