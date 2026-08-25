import { LuStore } from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";
import CartDrawer from "./CartDrawer";
import MobileHamBurgerMenu from "./mobile/hamburgerMenu";
import NavbarInput from "./NavbarInput";
import AccountDropDown from "@/components/shared/navbar/AccountDropDown";

const Navbar = () => {
  const navItems = [
    { name: "SHOP ALL", href: "/shop", icon: <LuStore size={24} /> },
  ];

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 ">
          <div className="flex items-center lg:w-1/3">
            {/* mobile hamburger menu */}
            <MobileHamBurgerMenu navItems={navItems} />

            {/* TODO: for lg screen */}
            <NavbarInput responsive={false} />
          </div>

          <div className="flex-1 flex items-center justify-center lg:w-1/3">
            <Link href={"/"} className="flex items-center gap-2 whitespace-nowrap">
              <Image
                src="/images/logo.png"
                alt="Aku logo"
                width={32}
                height={32}
                className="shrink-0 rounded-full object-cover"
              />
              <h1 className="leading-none text-2xl font-bold">Aku</h1>
            </Link>
          </div>

          <div className="flex items-center justify-end lg:w-1/3">
            <div className="">
              {" "}
              <AccountDropDown />
            </div>
            <CartDrawer />
          </div>
        </div>
        {/* TODO: for sm screen */}
        <NavbarInput responsive={true} />
      </div>

      <div className="hidden lg:block border-t border-gray-200 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-evenly py-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 group transition duration-300"
              >
                {item.name}

                <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black"></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
