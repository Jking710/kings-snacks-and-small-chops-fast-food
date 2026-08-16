import React, { useState } from "react";
import { ShoppingCart, Search, Star, Plus, Check } from "lucide-react";
import { useCart } from "../CartContext.jsx";
import { Link } from "react-router-dom";

import menuItems from "../data/menuItems.js";


const allMenuItems = [...menuItems];

const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Shawarma",
  "Small Chops",
  "Pastries",
  "Drinks",
  "Ice Cream",
];

function FoodImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-48 overflow-hidden bg-[#fff7ed]">
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-r from-[#f8e8d5] via-[#fffaf5] to-[#f8e8d5]" />
      )}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fff7ed] text-5xl">
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

  const filtered = allMenuItems.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.category === activeCategory;

    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  const handleAdd = (item) => {
    addToCart(item);

    setAddedIds((prev) => ({
      ...prev,
      [item.id]: true,
    }));

    setTimeout(
      () =>
        setAddedIds((prev) => ({
          ...prev,
          [item.id]: false,
        })),
      1500,
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">

      <div className="bg-linear-to-br from-[#2b2118] via-[#6f3d29] to-[#c45b2c] text-white py-14 px-6 text-center relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">

          <div className="absolute top-5 left-10 text-white opacity-10 text-8xl">
            🍕
          </div>

          <div className="absolute bottom-5 right-10 text-white opacity-10 text-7xl">
            🍔
          </div>

          <div className="absolute top-20 right-1/4 text-white opacity-5 text-7xl">
            🍦
          </div>

          <div className="absolute bottom-10 left-1/4 text-white opacity-5 text-7xl">
            🍩
          </div>

        </div>

        <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia'] relative">
          Our <span className="text-[#f6c99f]">Menu</span>
        </h1>

        <p className="mt-2 text-[#f8dfca] text-lg relative">
          Delicious snacks, treats and drinks made for you
        </p>

        <Link
          to="/cart"
          className="absolute top-5 right-5 lg:top-8 lg:right-8 flex items-center gap-2 bg-[#faf9f6] text-[#8b3e24] font-bold px-4 py-2 rounded-xl hover:bg-[#f6e2c4] transition-all hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5" />

          <span>Cart</span>

          {totalItems > 0 && (
            <span className="bg-[#c45b2c] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>

      </div>

      <div className="bg-[#fffdf9] sticky top-0 z-40 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="relative max-w-md mb-4">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8273] w-5 h-5" />

            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ead9ca] bg-[#fffaf5] focus:outline-none focus:ring-2 focus:ring-[#c45b2c] text-sm"
            />

          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#8b3e24] text-white shadow-md"
                    : "bg-[#fff3e7] text-[#8b3e24] border border-[#ead2bd] hover:bg-[#f8e1cf]"
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
          className="block bg-linear-to-r from-[#8b3e24] via-[#a94d2b] to-[#c45b2c] rounded-2xl p-6 lg:p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
        >

          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            <div>

              <p className="text-[#f6d4bd] text-sm font-semibold uppercase tracking-wider">
                Create your own combination
              </p>

              <h2 className="text-2xl lg:text-3xl font-bold font-['Georgia'] mt-1">
                🎁 Build Your Snack Box
              </h2>

              <p className="text-[#fff0e5] mt-2 text-sm lg:text-base">
                Pick your favorite snacks and create a box made for you.
              </p>

            </div>

            <span className="bg-[#faf9f6] text-[#8b3e24] px-6 py-3 rounded-xl font-bold whitespace-nowrap">
              Build My Box →
            </span>

          </div>

        </Link>

      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {filtered.length === 0 ? (

          <div className="text-center py-20">

            <p className="text-6xl mb-4">
              🍽️
            </p>

            <p className="text-[#806d61] text-lg">
              No items found. Try a different search.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filtered.map((item) => (

              <div
                key={item.id}
                className="bg-[#fffdf9] rounded-2xl shadow-sm border border-[#ead9ca] hover:shadow-[#d9b9a2] hover:shadow-md transition-all overflow-hidden group flex flex-col h-full"
              >

                <FoodImage
                  src={item.img}
                  alt={item.name}
                />

                <div className="p-4 flex flex-col flex-1">

                  <div>

                    {item.tag && (
                      <span className="inline-block bg-[#f7e1d0] text-[#8b3e24] text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                        {item.tag}
                      </span>
                    )}

                    <h3 className="font-bold text-[#33251e] text-base font-['Georgia']">
                      {item.name}
                    </h3>

                    <p className="text-[#806d61] text-xs mt-1 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>

                    <div className="flex mt-2 gap-0.5">

                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < item.rating
                              ? "fill-[#d99a27] text-[#d99a27]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}

                    </div>

                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#ead9ca]">

                    <span className="text-[#a94d2b] font-bold text-lg">
                      ₦{item.price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        addedIds[item.id]
                          ? "bg-[#4f8a62] text-white"
                          : "bg-[#8b3e24] text-white hover:bg-[#c45b2c] hover:scale-105"
                      }`}
                    >

                      {addedIds[item.id] ? (
                        <>
                          <Check className="w-4 h-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add
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

