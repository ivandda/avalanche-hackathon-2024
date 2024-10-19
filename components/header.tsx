import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/react";
import SignInButton from "./connectButton";

const Header = () => {
  return (
    <Navbar className="w-full p-8" position="static" isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">Vouch4Edu</p>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <div></div>
        </NavbarItem>
        <NavbarItem isActive>
          <div></div>
        </NavbarItem>
        <NavbarItem>
          <div></div>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" className="absolute right-10">
        <NavbarItem>
          <SignInButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

export default Header;