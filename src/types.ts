export interface Campground {
  id: string;
  nm: string;
  addr: string;
  lat: number;
  lng: number;
  do: string;
  sigungu: string;
  type: string;
  env: string;
  fac: string;
  img: string;
  resve: string;
  price: number | null;
  stone: boolean;
  parking: boolean;
  camfit: boolean;
  timeHome?: number;
  timeWork?: number;
  roadDistHome?: number;
  roadDistWork?: number;
}
