"use client";

import SearchBar from "../search/Search";

const Home = () => {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-cyber md:rounded-none">
      <div className="shrink-0  border-white/10 bg-cyber px-4 py-3">
        <SearchBar />
      </div>

      {/* MESSAGE LIST (SCROLL AREA) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-cyber bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat"></div>
    </div>
  );
};

export default Home;
