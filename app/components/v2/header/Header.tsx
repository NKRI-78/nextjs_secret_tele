import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    // <header className="flex flex-col h-40 items-center justify-center p-4 relative bg-dark-blue">
    //   {pathname !== "/auth/change-password" && pathname !== "/auth/profile" && (
    //     <div className="w-full my-4 max-w-xl relative"></div>
    //   )}
    // </header>
    <header className="h-16 bg-cyber text-white shadow flex items-center px-6 py-4 border--2 border-[#1F1F1F]">
      <h1 className="text-xl font-semibold">HASIL PENCARIAN</h1>
    </header>
  );
};

export default Header;
