const images = {
  SUV: {
    src: "/images/suv.jpg",
    credit: "Natalya Sh / Pexels",
    url: "https://www.pexels.com/photo/a-black-suv-car-parked-on-the-road-9735036/",
  },
  truck: {
    src: "/images/truck.jpg",
    credit: "Siddant Kanthi / Pexels",
    url: "https://www.pexels.com/photo/black-pickup-truck-parked-on-suburban-street-29355027/",
  },
  hatchback: {
    src: "/images/hatchback.jpg",
    credit: "Robert Haverly / Unsplash",
    url: "https://unsplash.com/photos/black-5-door-hatchback-ZhEnFcHO0es",
  },
  car: {
    src: "/images/car.jpg",
    credit: "Samuele Errico Piccarini / Unsplash",
    url: "https://unsplash.com/photos/black-sedan-FMbWFDiVRPs",
  },
};
export const illustration = (vehicle) =>
  images[vehicle.body_style] || images.car;
