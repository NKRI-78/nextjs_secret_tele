"use client";

import SearchBar from "../search/Search";

const HomeResult = () => {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-cyber md:rounded-none">
      {/* <div className="shrink-0 sticky top-0 z-20 border-bottom-cyber bg-cyber backdrop-blur">
        {selected ? (
          <div className="flex items-center gap-4 p-4">
            <div className="font-medium text-white truncate">
              {selected.name}
            </div>
          </div>
        ) : (
          <div className="p-3 text-sm text-gray-500">Select a chat</div>
        )}
      </div> */}

      <div className="shrink-0  border-white/10 bg-cyber px-4 py-3">
        <SearchBar />
      </div>

      {/* MESSAGE LIST (SCROLL AREA) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-cyber bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat"></div>
    </div>
  );
};

export default HomeResult;
