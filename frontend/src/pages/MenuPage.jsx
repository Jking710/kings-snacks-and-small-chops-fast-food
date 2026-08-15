import React, { useState } from "react";
import { ShoppingCart, Search, Star, Plus, Check } from "lucide-react";
import { useCart } from "../CartContext.jsx";
import { Link } from "react-router-dom";

import menuItems from "../data/menuItems.js";

const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Shawarma",
  "Small Chops",
  "Pastries",
  "Drinks",
];

function FoodImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-48 overflow-hidden bg-orange-50">
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-r from-orange-100 via-white to-orange-100" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-50 text-5xl">
          🍽️
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState({});
  const { addToCart, totalItems } = useCart();

  const filtered = menuItems.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (item) => {
    addToCart(item);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [item.id]: false })),
      1500,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-r from-yellow-600 to-orange-600 text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 left-10 text-white opacity-10 text-8xl">
            🍕
          </div>
          <div className="absolute bottom-5 right-10 text-white opacity-10 text-7xl">
            🍔
          </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia'] relative">
          Our <span className="text-yellow-200">Menu</span>
        </h1>
        <p className="mt-2 text-orange-100 text-lg relative">
          Over 24 delicious items — something for everyone
        </p>
        <Link
          to="/cart"
          className="absolute top-5 right-5 lg:top-8 lg:right-8 flex items-center gap-2 bg-white text-orange-600 font-bold px-4 py-2 rounded-xl hover:bg-orange-50 transition-all hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link
          to="/build-snack-box"
          className="block bg-linear-to-r from-orange-600 to-rose-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider">
                Create your own combination
              </p>

              <h2 className="text-2xl lg:text-3xl font-bold font-['Georgia'] mt-1">
                🎁 Build Your Snack Box
              </h2>

              <p className="text-orange-50 mt-2 text-sm lg:text-base">
                Pick your favorite snacks and create a box made for you.
              </p>
            </div>

            <span className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold whitespace-nowrap">
              Build My Box →
            </span>
          </div>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-gray-500 text-lg">
              No items found. Try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-orange-100 hover:shadow-orange-200 hover:shadow-md transition-all overflow-hidden group flex flex-col h-full"
              >
                <FoodImage src={item.img} alt={item.name} />
                <div className="p-4 flex flex-col flex-1">
                  <div>
                    {item.tag && (
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                        {item.tag}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-800 text-base font-['Georgia']">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                    <div className="flex mt-2 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-orange-100">
                    <span className="text-orange-600 font-bold text-lg">
                      ₦{item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        addedIds[item.id]
                          ? "bg-green-500 text-white"
                          : "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105"
                      }`}
                    >
                      {addedIds[item.id] ? (
                        <>
                          <Check className="w-4 h-4" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
