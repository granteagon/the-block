export const money = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
export const number = (n) => n.toLocaleString("en-CA");
