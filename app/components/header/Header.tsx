import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";

const SearchBar = () => {
  const pathname = usePathname();

  return (
    <header className="flex flex-col h-40 items-center justify-center p-4 relative bg-dark-blue">
      {pathname !== "/auth/change-password" && pathname !== "/auth/profile" && (
        <div className="w-full my-4 max-w-xl relative"></div>
      )}
    </header>
  );
};

export default SearchBar;
