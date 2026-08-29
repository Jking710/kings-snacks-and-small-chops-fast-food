import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  ShoppingCart,
  ArrowLeft,
  Check,
  Gift,
} from "lucide-react";
import { useCart } from "../CartContext.jsx";
import menuItems from "../data/menuItems.js";

const surpriseTypes = [
  {
    id: "sweet",
    title: "Sweet Treat",
    description: "Random sweet snacks and pastries",
    categories: ["Pastries"],
  },
  {
    id: "savory",
    title: "Savory Snacks",
    description: "A surprise mix of savory snacks",
    categories: ["Pizza", "Burgers", "Shawarma", "Small Chops"],
  },
  {
    id: "drink",
    title: "Snack + Drink",
    description: "A snack paired with a refreshing drink",
    categories: [
      "Pizza",
      "Burgers",
      "Shawarma",
      "Small Chops",
      "Pastries",
      "Drinks",
    ],
  },
  {
    id: "full",
    title: "Full Surprise",
    description: "Let us choose everything for you",
    categories: [
      "Pizza",
      "Burgers",
      "Shawarma",
      "Small Chops",
      "Pastries",
      "Drinks",
    ],
  },
];

function getRandomItems(items, count) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function SurpriseMe() {
  const { addToCart } = useCart();

  const [selectedType, setSelectedType] = useState("full");
  const [surpriseItems, setSurpriseItems] = useState([]);
  const [hasSurprise, setHasSurprise] = useState(false);
  const [addedIds, setAddedIds] = useState({});

  const selectedOption = surpriseTypes.find(
    (type) => type.id === selectedType,
  );

  const total = surpriseItems.reduce(
    (sum, item) => sum + item.price,
    0,
  );

  const createSurprise = () => {
    const categories = selectedOption.categories;

    const availableItems = menuItems.filter((item) =>
      categories.includes(item.category),
    );

    let count = 3;

    if (selectedType === "sweet") {
      count = 2;
    }

    if (selectedType === "savory") {
      count = 3;
    }

    if (selectedType === "drink") {
      count = 2;
    }

    if (selectedType === "full") {
      count = 4;
    }

    const selected = getRandomItems(availableItems, count);

    /*
      For Snack + Drink, make sure the selection contains
      at least one drink when your menu has drinks.
    */
    if (selectedType === "drink") {
      const drinks = menuItems.filter(
        (item) => item.category === "Drinks",
      );

      const snacks = menuItems.filter(
        (item) => item.category !== "Drinks",
      );

      if (drinks.length > 0 && snacks.length > 0) {
        const randomSnack = getRandomItems(snacks, 1)[0];
        const randomDrink = getRandomItems(drinks, 1)[0];

        setSurpriseItems([randomSnack, randomDrink]);
      } else {
        setSurpriseItems(selected);
      }
    } else {
      setSurpriseItems(selected);
    }

    setHasSurprise(true);
    setAddedIds({});
  };

  const handleAdd = (item) => {
    addToCart(item);

    setAddedIds((prev) => ({
      ...prev,
      [item.id]: true,
    }));

    setTimeout(() => {
      setAddedIds((prev) => ({
        ...prev,
        [item.id]: false,
      }));
    }, 1500);
  };

  const addAllToCart = () => {
    surpriseItems.forEach((item) => {
      addToCart(item);
    });

    const added = {};

    surpriseItems.forEach((item) => {
      added[item.id] = true;
    });

    setAddedIds(added);

    setTimeout(() => {
      setAddedIds({});
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-br from-[#7c2d12] via-[#c2410c] to-[#9f1239] text-white py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Gift className="w-10 h-10" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia']">
              Surprise Me
            </h1>

            <p className="text-orange-100 mt-3 text-base lg:text-lg max-w-2xl mx-auto">
              Don't know what to order? Pick a surprise style and let us
              choose your snacks.
            </p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 lg:p-8">
          <div className="text-center mb-8">
            <Sparkles className="w-7 h-7 text-orange-600 mx-auto mb-3" />

            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 font-['Georgia']">
              What kind of surprise do you want?
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              You choose the style. We choose the snacks.
            </p>
          </div>

          {/* Surprise Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {surpriseTypes.map((type) => {
              const active = selectedType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setHasSurprise(false);
                  }}
                  className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    active
                      ? "border-orange-600 bg-orange-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/50"
                  }`}
                >

                  <h3 className="font-bold text-gray-800 font-['Georgia']">
                    {type.title}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    {type.description}
                  </p>

                  {active && (
                    <div className="flex items-center gap-1 text-orange-600 text-xs font-bold mt-3">
                      <Check className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Surprise Button */}
          <button
            onClick={createSurprise}
            className="w-full max-w-xl mx-auto mt-8 bg-linear-to-r from-orange-600 to-rose-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-rose-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            Surprise Me
          </button>
        </div>

        {/* Results */}
        {hasSurprise && (
          <div className="mt-8">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 text-center">
              <p className="text-orange-700 font-semibold text-sm">
                Your surprise is ready
              </p>

              <h2 className="text-2xl font-bold text-gray-800 font-['Georgia'] mt-1">
                Here's what we picked for you
              </h2>

              <p className="text-orange-600 font-bold text-lg mt-2">
                Total: ₦{total.toLocaleString()}
              </p>
            </div>

            {surpriseItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-orange-100">
                <p className="text-gray-500">
                  We couldn't find suitable snacks for this surprise.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {surpriseItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="h-44 bg-orange-50 overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-orange-600 font-semibold">
                          {item.category}
                        </p>

                        <h3 className="font-bold text-gray-800 text-lg font-['Georgia'] mt-1">
                          {item.name}
                        </h3>

                        <p className="text-orange-600 font-bold mt-2">
                          ₦{item.price.toLocaleString()}
                        </p>

                        <button
                          onClick={() => handleAdd(item)}
                          className={`w-full mt-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                            addedIds[item.id]
                              ? "bg-green-500 text-white"
                              : "bg-orange-600 text-white hover:bg-orange-700"
                          }`}
                        >
                          {addedIds[item.id] ? (
                            <>
                              <Check className="w-4 h-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={createSurprise}
                    className="flex-1 py-3 rounded-xl border border-orange-200 bg-white text-orange-600 font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Surprise Me Again
                  </button>

                  <button
                    onClick={addAllToCart}
                    className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add Surprise to Cart
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SurpriseMe;