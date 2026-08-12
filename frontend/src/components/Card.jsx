import React from "react";
import { Link } from "react-router-dom";

function Card({ menu }) {
  return (
    <div className="rounded-lg border-orange-500 flex flex-col items-center space-y-4 py-4 px-6 bg-orange-50 hover:shadow-orange-500 shadow-md font-[Georgia] hover:scale-100 transition-all cursor-pointer">
      <img src={menu.snacks} alt={menu.name} className="w-full h-65 object-cover rounded-lg" />
      <h2 className="text-xl lg:text-2xl font-semibold">{menu.name}</h2>
      <p className="lg:text-sm text-[14px] text-center">{menu.desc}</p>
      <Link
        to="/login"
        className="px-3 py-2 bg-orange-600 rounded-lg w-full text-center text-white cursor-pointer hover:bg-orange-500 hover:text-white transition-all font-semibold"
      >
        Order Now
      </Link>
    </div>
  );
}

export default Card;
