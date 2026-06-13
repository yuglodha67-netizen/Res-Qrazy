export interface Order {
  id: string;
  table: number | string;
  items: string[];
  status: "preparing" | "ready";
  time: string;
}
