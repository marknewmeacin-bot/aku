import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { AtSign } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const companyLinks = [
  "About Us",
  "Careers",
  "Affiliates",
  "Blog",
  "Contact Us",
];

const shopLinks = [
  "New Arrivals",
  "Accessories",
  "Men",
  "Women",
  "All Products",
];

const helpLinks = [
  "Customer Service",
  "My Account",
  "Find a Store",
  "Legal & Privacy",
  "Gift Card",
];

export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Aku</h2>

          <p className="text-sm">
            8569 Bond Rd, Elk Grove, California, 95624, United States.
          </p>

          <p className="text-sm">contact@aku.com</p>

          <p className="text-sm">+(916) 685-5555</p>

          <div className="flex items-center gap-4">
            <FaFacebookF size={20} />
            <FaInstagram size={20} />
            <FaYoutube size={20} />
            <AtSign size={20} />
            <FaTwitter size={20} />
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">COMPANY</h3>

          <ul className="space-y-2 text-sm">
            {companyLinks.map((item) => (
              <li key={item}>
                <a href="#" className="hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">SHOP</h3>

          <ul className="space-y-2 text-sm">
            {shopLinks.map((item) => (
              <li key={item}>
                <a href="#" className="hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">HELP</h3>

          <ul className="space-y-2 text-sm">
            {helpLinks.map((item) => (
              <li key={item}>
                <a href="#" className="hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Subscribe */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SUBSCRIBE</h3>

          <p className="text-sm">
            Be the first to get the latest news about trends, promotions, new
            arrivals, discounts and more!
          </p>

          <div className="flex">
            <Input
              type="email"
              placeholder="Email Address"
              className="rounded-r-none border-white bg-white text-black"
            />

            <Button
              type="button"
              className="rounded-l-none bg-white text-black hover:bg-gray-200"
            >
              JOIN
            </Button>
          </div>

          <p className="text-sm font-semibold">Secure Payments</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-gray-700 pt-8 text-sm md:flex-row">
        <p>© 2025 AKU </p>

        <div className="flex items-center gap-4">
          <span>Language</span>
          <span className="font-semibold">United States | English</span>
          <span>Currency</span>
          <span className="font-semibold">USD</span>
        </div>
      </div>
    </footer>
  );
}