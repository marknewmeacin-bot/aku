import { FaBath } from "react-icons/fa";
import { GiPerfumeBottle } from "react-icons/gi";
import { GrLike } from "react-icons/gr";
import { LuStore } from "react-icons/lu";
import { MdFace4 } from "react-icons/md";
import { PiHighlighterCircleBold } from "react-icons/pi";
import { RiDiscountPercentFill } from "react-icons/ri";

export const navItems = [
  {
    name: "CRAZY DEALS",
    icon: RiDiscountPercentFill,
  },
  {
    name: "SHOP ALL",
    icon: LuStore,
  },
  {
    name: "BESTSELLERS",
    icon: GrLike,
  },
  {
    name: "PERFUMES",
    icon: GiPerfumeBottle,
    submenu: [
      "Men's Perfume",
      "Women's Perfume",
      "Unisex Perfume",
      "New Arrivals",
    ],
  },
  {
    name: "BATH & BODY",
    icon: FaBath,
    submenu: [
      "Shower Gel",
      "Body Lotion",
      "Hand Cream",
      "Body Scrub",
    ],
  },
  {
    name: "MAKEUP",
    icon: PiHighlighterCircleBold,
  },
  {
    name: "SKINCARE",
    icon: MdFace4,
    submenu: [
      "Cleansers",
      "Moisturizers",
      "Serums",
      "Sunscreen",
    ],
  },
];