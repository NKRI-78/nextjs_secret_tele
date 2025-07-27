// app/404.tsx (for App Router)

import React from "react";

const Custom404: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-xl text-gray-600">Oops! Page not found.</p>
        <p className="mt-2 text-md text-gray-500">
          The page you are looking for does not exist.
        </p>
        <a href="/" className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default Custom404;