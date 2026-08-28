import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import { useCart } from "../CartContext.jsx";
import { menuItems } from "../data/menuItems.js";

const BOXES = [
  {
    id: "small",
    name: "Small Box",
    slots: 4,
    price: 3000,
    description: "Perfect for one person",
  },
  {
    id: "medium",
    name: "Medium Box",
    slots: 6,
    price: 4500,
    description: "Great for a bigger snack break",
  },
  {
    id: "large",
    name: "Large Box",
    slots: 10,
    price: 7000,
    description: "Made for sharing",
  },
];

const EXTRAS = [
  {
    id: "extra-drink",
    name: "Extra Drink",
    price: 500,
  },
  {
    id: "extra-sauce",
    name: "Special Sauce",
    price: 300,
  },
  {
    id: "extra-cheese",
    name: "Extra Cheese",
    price: 500,
  },
];

function BuildSnackBox() {
  const { addToCart } = useCart();

  const [selectedBox, setSelectedBox] = useState(BOXES[0]);
  const [selectedSnacks, setSelectedSnacks] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [added, setAdded] = useState(false);

  // Weight and food preference
  const [weight, setWeight] = useState("");
  const [foodGoal, setFoodGoal] = useState("balanced");
  const [showRecommended, setShowRecommended] = useState(false);

  const remainingSlots = selectedBox.slots - selectedSnacks.length;

  const snacksPrice = useMemo(() => {
    return selectedSnacks.reduce((total, snack) => total + snack.price, 0);
  }, [selectedSnacks]);

  const extrasPrice = useMemo(() => {
    return selectedExtras.reduce((total, extra) => total + extra.price, 0);
  }, [selectedExtras]);

  const totalPrice = selectedBox.price + snacksPrice + extrasPrice;

  /*
    The weight field is used as a personal reference.

    Food recommendations are based on the food tags in menuItems.js.
    Weight alone does not determine a person's nutritional needs.
  */
  const recommendedSnacks = useMemo(() => {
    if (!showRecommended) {
      return menuItems;
    }

    return menuItems.filter((item) => {
      if (foodGoal === "gain") {
        return item.weightGoal === "gain" || item.weightGoal === "both";
      }

      return item.weightGoal === "balanced" || item.weightGoal === "both";
    });
  }, [foodGoal, showRecommended]);

  const handleBoxChange = (box) => {
    setSelectedBox(box);

    if (selectedSnacks.length > box.slots) {
      setSelectedSnacks(selectedSnacks.slice(0, box.slots));
    }
  };

  const addSnack = (snack) => {
    if (selectedSnacks.length >= selectedBox.slots) {
      return;
    }

    setSelectedSnacks((prev) => [...prev, snack]);
  };

  const removeSnack = (index) => {
    setSelectedSnacks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((item) => item.id === extra.id);

      if (exists) {
        return prev.filter((item) => item.id !== extra.id);
      }

      return [...prev, extra];
    });
  };

  const handleAddToCart = () => {
    if (selectedSnacks.length !== selectedBox.slots) {
      return;
    }

    const snackNames = selectedSnacks.map((snack) => snack.name).join(", ");

    const extraNames =
      selectedExtras.length > 0
        ? selectedExtras.map((extra) => extra.name).join(", ")
        : "None";

    const snackBox = {
      id: `snack-box-${Date.now()}`,
      name: `${selectedBox.name} - Custom`,
      desc: `Custom snack box containing ${snackNames}. Extras: ${extraNames}.`,
      emoji: "🎁",
      price: totalPrice,
      category: "Custom Snack Box",
      quantity: 1,
      customBox: true,
      boxSize: selectedBox.name,

      weightPreference: {
        weight: weight ? Number(weight) : null,
        goal: foodGoal,
      },

      snacks: selectedSnacks.map((snack) => ({
        id: snack.id,
        name: snack.name,
        price: snack.price,
        weightGoal: snack.weightGoal,
      })),

      extras: selectedExtras,
    };

    addToCart(snackBox);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 3000);
  };

  const clearBox = () => {
    setSelectedSnacks([]);
    setSelectedExtras([]);
  };

  const goalLabel =
    foodGoal === "gain"
      ? "Foods suited to your weight-gain preference"
      : "Foods suited to your balanced-weight preference";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-linear-to-br from-[#2b2118] via-[#6f3d29] to-[#c45b2c] text-white">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-[#f6d4bd] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <div className="max-w-3xl">
            <p className="text-[#f6d4bd] uppercase tracking-widest text-sm font-semibold mb-2">
              Customize your order
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia']">
              Build Your Snack Box
            </h1>

            <p className="text-[#fff0e5] mt-4 text-base lg:text-lg">
              Pick your favorite snacks and create a box made for you.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        {/* Weight Preference */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-orange-600" />

              <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
                Your Food Preference
              </h2>
            </div>

            <p className="text-gray-500 mt-1">
              Tell us your weight and the type of food you prefer.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight */}
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Your weight
                </label>

                <div className="relative">
                  <input
                    id="weight"
                    type="number"
                    min="1"
                    max="500"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter your weight"
                    className="w-full px-4 py-3 pr-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    kg
                  </span>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  What type of food do you prefer?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFoodGoal("gain")}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      foodGoal === "gain"
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          Gain Weight
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Higher-energy food choices
                        </p>
                      </div>

                      {foodGoal === "gain" && (
                        <Check className="w-5 h-5 text-orange-600 ml-auto" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFoodGoal("balanced")}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      foodGoal === "balanced"
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          Balanced Options
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Lighter balanced food choices
                        </p>
                      </div>

                      {foodGoal === "balanced" && (
                        <Check className="w-5 h-5 text-orange-600 ml-auto" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 bg-orange-50 rounded-xl p-4">
              <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />

              <p className="text-sm text-gray-600">
                Your weight is used as a personal reference. The food
                suggestions are based on the food preference you select.
                Weight alone does not determine your nutritional needs.
              </p>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  {weight
                    ? `Your weight: ${weight} kg`
                    : "Enter your weight for your box preference"}
                </p>

                <p className="font-bold text-orange-600 mt-1">
                  {goalLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRecommended((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                  showRecommended
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                <Sparkles className="w-5 h-5" />

                {showRecommended
                  ? "Showing Recommended"
                  : "Show Recommended Foods"}
              </button>
            </div>
          </div>
        </section>

        {/* Box Size */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
              1. Choose your box
            </h2>

            <p className="text-gray-500 mt-1">
              Choose how many snacks you want in your box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BOXES.map((box) => {
              const isSelected = selectedBox.id === box.id;

              return (
                <button
                  key={box.id}
                  type="button"
                  onClick={() => handleBoxChange(box)}
                  className={`text-left rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-orange-600 bg-orange-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        {box.name}
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        {box.description}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="w-7 h-7 bg-orange-600 text-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <span className="text-orange-600 font-bold">
                      {box.slots} snacks
                    </span>

                    <span className="text-xl font-bold text-gray-800">
                      ₦{box.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Snack Selection */}
          <section className="lg:col-span-2">
            <div className="mb-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
                    2. Choose your snacks
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Pick {selectedBox.slots} snacks for your box.
                  </p>
                </div>

                <div
                  className={`font-bold ${
                    remainingSlots === 0
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {selectedSnacks.length}/{selectedBox.slots} selected
                </div>
              </div>
            </div>

            {showRecommended && (
              <div className="mb-5 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />

                <div>
                  <p className="font-bold text-orange-800">
                    Recommended for you
                  </p>

                  <p className="text-sm text-orange-700 mt-1">
                    These food choices match your selected preference.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedSnacks.map((snack) => (
                <button
                  key={snack.id}
                  type="button"
                  onClick={() => addSnack(snack)}
                  disabled={selectedSnacks.length >= selectedBox.slots}
                  className={`bg-white rounded-2xl border border-orange-100 overflow-hidden text-left shadow-sm transition-all ${
                    selectedSnacks.length >= selectedBox.slots
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={snack.img}
                      alt={snack.name}
                      className="w-full h-32 object-cover"
                    />

                    {showRecommended && (
                      <span className="absolute top-2 left-2 bg-white/90 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm truncate">
                      {snack.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {snack.foodNote}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-orange-600 font-bold text-sm">
                        ₦{snack.price.toLocaleString()}
                      </span>

                      <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {recommendedSnacks.length === 0 && (
              <div className="bg-white rounded-2xl border border-orange-100 p-8 text-center">
                <p className="text-4xl mb-3">🍽️</p>

                <p className="font-bold text-gray-800">
                  No matching food choices found.
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Turn off recommendations to view the full menu.
                </p>
              </div>
            )}

            {/* Extras */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
                3. Add extras
              </h2>

              <p className="text-gray-500 mt-1 mb-5">
                Add something extra to your snack box.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {EXTRAS.map((extra) => {
                  const isSelected = selectedExtras.some(
                    (item) => item.id === extra.id
                  );

                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-orange-600 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {extra.name}
                          </p>

                          <p className="text-orange-600 text-sm font-bold mt-1">
                            +₦{extra.price.toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Preview */}
          <aside>
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800 font-['Georgia']">
                  Your Snack Box
                </h2>

                {selectedSnacks.length > 0 && (
                  <button
                    type="button"
                    onClick={clearBox}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Clear box"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Preference Summary */}
              {(weight || foodGoal) && (
                <div className="bg-orange-50 rounded-xl p-4 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-orange-600" />

                    <p className="font-bold text-gray-800 text-sm">
                      Food Preference
                    </p>
                  </div>

                  {weight && (
                    <p className="text-xs text-gray-500">
                      Weight:{" "}
                      <span className="font-semibold text-gray-700">
                        {weight} kg
                      </span>
                    </p>
                  )}

                  <p className="text-xs text-orange-600 font-semibold mt-1">
                    {foodGoal === "gain"
                      ? "More filling food choices"
                      : "Balanced food choices"}
                  </p>
                </div>
              )}

              <div className="bg-orange-50 rounded-2xl p-5 text-center mb-5">
                <div className="text-6xl mb-3">🎁</div>

                <p className="font-bold text-gray-800">
                  {selectedBox.name}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedSnacks.length} of {selectedBox.slots} snacks
                </p>
              </div>

              <div className="space-y-3">
                {selectedSnacks.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-5">
                    Your selected snacks will appear here.
                  </p>
                ) : (
                  selectedSnacks.map((snack, index) => (
                    <div
                      key={`${snack.id}-${index}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={snack.img}
                        alt={snack.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 text-sm truncate">
                          {snack.name}
                        </p>

                        <p className="text-orange-600 text-xs">
                          ₦{snack.price.toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSnack(index)}
                        className="text-gray-300 hover:text-red-500 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {selectedExtras.length > 0 && (
                <div className="border-t border-gray-100 mt-5 pt-5">
                  <p className="font-semibold text-gray-700 text-sm mb-3">
                    Extras
                  </p>

                  <div className="space-y-2">
                    {selectedExtras.map((extra) => (
                      <div
                        key={extra.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-500">{extra.name}</span>

                        <span className="font-semibold text-gray-700">
                          ₦{extra.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 mt-5 pt-5 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Box</span>
                  <span>₦{selectedBox.price.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Snacks</span>
                  <span>₦{snacksPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Extras</span>
                  <span>₦{extrasPrice.toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>

                  <span className="font-bold text-xl text-orange-600">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={selectedSnacks.length !== selectedBox.slots}
                className={`w-full mt-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedSnacks.length === selectedBox.slots
                    ? "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />

                {added
                  ? "Added to Cart ✓"
                  : selectedSnacks.length === selectedBox.slots
                  ? `Add Box to Cart — ₦${totalPrice.toLocaleString()}`
                  : `Choose ${remainingSlots} more snack${
                      remainingSlots === 1 ? "" : "s"
                    }`}
              </button>

              {added && (
                <Link
                  to="/cart"
                  className="block text-center text-orange-600 font-semibold text-sm mt-3 hover:underline"
                >
                  View Cart
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default BuildSnackBox;