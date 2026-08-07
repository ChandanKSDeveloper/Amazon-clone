// src/components/product/amazonStyles.js

export const amazonClasses = {
  // Buttons
  btnYellow: "",
  btnOrange:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFA41C] px-4 py-2 text-sm font-medium text-black shadow-sm transition-all hover:bg-[#FA8900] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FA8900] disabled:cursor-not-allowed disabled:bg-gray-300",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFF] px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-[#F7FAFA] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#007185] transition-all hover:bg-[#F0F8FF] hover:underline focus:outline-none",
  iconBtn:
    "inline-flex items-center justify-center rounded-lg p-2 text-gray-700 border border-gray-300 bg-white shadow-sm transition-all hover:bg-[#F7FAFA] hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400",

  // Badges
  badgeSecondary:
    "inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800",
  badgeDiscount:
    "inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white",
  badgeLowStock:
    "inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 border border-orange-200",

  // Layout & UI Elements
  inputBase:
    "h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#007185] focus:outline-none focus:ring-1 focus:ring-[#007185] transition-all",
  cardBase: "rounded-lg border border-gray-200 bg-white shadow-sm",
  divider: "border-t border-gray-200",
  linkText:
    "text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer",

  // Quantity Selector
  qtyBtn:
    "flex h-8 w-8 items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  qtyDisplay:
    "flex h-8 w-10 items-center justify-center border-x border-gray-200 bg-white font-medium text-sm",
};

export const amazonBtnYellow = `
  inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFD814] px-4 py-2 
  text-sm font-medium text-black shadow-sm transition-all hover:bg-[#F7CA00] focus:outline-none focus:ring-2 
  focus:ring-offset-1 focus:ring-[#F7CA00] disabled:cursor-not-allowed disabled:bg-gray-300
  `;

export const amazonInput = `
  w-full h-10 px-3 rounded-sm border border-gray-300 text-sm text-[#0F1111] bg-white
  focus:outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] focus:shadow-[0_0_0_3px_rgba(228,168,49,0.3)]
  placeholder:text-gray-500
`;

export const amazonPrimaryBtn = `
  w-full h-10 rounded-sm text-sm font-medium 
  bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#E7B800] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]
  text-[#0F1111] shadow-sm hover:shadow-md transition-all
  disabled:bg-[#FFD814] disabled:opacity-60 disabled:cursor-not-allowed
`;

export const amazonQtyBtn = `
  w-8 h-8 flex items-center justify-center border border-gray-300 bg-gray-50 
  text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors
  disabled:opacity-40 disabled:cursor-not-allowed
`;

export const amazonCheckoutBtn = `
  w-full h-10 rounded-sm text-sm font-medium 
  bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#E7B800] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]
  text-[#0F1111] shadow-sm hover:shadow-md transition-all
`;

export const amazonSelect = `
  w-full h-10 px-3 rounded-sm border border-gray-300 text-sm text-[#0F1111] bg-white
  focus:outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] focus:shadow-[0_0_0_3px_rgba(228,168,49,0.3)]
  appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:12px]
`;
