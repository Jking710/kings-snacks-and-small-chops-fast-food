import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { useCart } from "../CartContext.jsx";
import menuItems from "../data/menuItems.js";

function SmartBudget() {
  const { addToCart } = useCart();

  const [budget, setBudget] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [added, setAdded] = useState(false);

  const numericBudget = Number(budget);

  const recommendationTotal = useMemo(() => {
    return recommendations.reduce(
      (total, item) => total + item.price,
      0
    );
  }, [recommendations]);

  const remaining = numericBudget - recommendationTotal;

  const generateRecommendations = () => {
    if (!numericBudget || numericBudget < 500) {
      setRecommendations([]);
      setGenerated(false);
      return;
    }

    const shuffled = [...menuItems].sort(() => Math.random() - 0.5);

    const selected = [];
    let total = 0;

    for (const item of shuffled) {
      if (total + item.price <= numericBudget) {
        selected.push(item);
        total += item.price;
      }

      if (selected.length >= 5) {
        break;
      }
    }

    setRecommendations(selected);
    setGenerated(true);
    setAdded(false);
  };

  const addRecommendationToCart = () => {
    recommendations.forEach((item) => {
      addToCart(item);
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-linear-to-br from-[#7c2d12] via-[#c2410c] to-[#9f1239] text-white">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <div className="max-w-3xl">
            <p className="text-orange-100 text-sm font-semibold uppercase tracking-widest">
              Smart ordering
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia'] mt-2">
              Smart Budget
            </h1>

            <p className="text-orange-50 mt-4 text-base lg:text-lg">
              Tell us how much you want to spend and we'll create a snack
              combination for you.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
                What's your budget?
              </h2>

              <p className="text-gray-500 text-sm">
                Enter the amount you want to spend.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-orange-600">
                ₦
              </span>

              <input
                type="number"
                min="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter your budget"
                className="w-full border-2 border-gray-200 rounded-xl py-4 pl-10 pr-4 outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={generateRecommendations}
              className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Find My Snacks
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[2000, 3000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setBudget(String(amount))}
                className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold hover:bg-orange-100 transition-colors cursor-pointer"
              >
                ₦{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {generated && (
          <section className="mt-10">
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-orange-100 p-10 text-center">
                <div className="text-5xl mb-4">😕</div>

                <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
                  We couldn't find a combination
                </h2>

                <p className="text-gray-500 mt-2">
                  Try increasing your budget to at least ₦500.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
                      Your recommendation
                    </p>

                    <h2 className="text-3xl font-bold text-gray-800 font-['Georgia'] mt-1">
                      Snacks within your budget 🎯
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={generateRecommendations}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Another
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-36 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 text-sm truncate">
                          {item.name}
                        </h3>

                        <p className="text-orange-600 font-bold mt-2">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <p className="text-gray-500 text-sm">
                        Your Budget
                      </p>

                      <p className="text-xl font-bold text-gray-800 mt-1">
                        ₦{numericBudget.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Recommended Total
                      </p>

                      <p className="text-xl font-bold text-orange-600 mt-1">
                        ₦{recommendationTotal.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Money Remaining
                      </p>

                      <p
                        className={`text-xl font-bold mt-1 ${
                          remaining >= 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        ₦{Math.max(remaining, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addRecommendationToCart}
                    className="w-full mt-6 bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />

                    {added
                      ? "Added to Cart ✓"
                      : `Add All to Cart — ₦${recommendationTotal.toLocaleString()}`}
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
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default SmartBudget;