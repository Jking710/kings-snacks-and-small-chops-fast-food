import React from "react";
import snacks from "../assets/hero.jpg";
import playstore from "../assets/playstore.png";
import appstore from "../assets/appstore.png";
import pizza from "../assets/pizza.webp";
import alarm from "../assets/alarmclock.png";
import discount from "../assets/discount.gif";
import cs from "../assets/CS.png";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="min-h-[600px] bg-linear-to-br from-[#fff8ed] via-[#f6e2c4] to-[#d9825b] selection:transparent selection:text-current">
      <div className="flex lg:flex-row flex-col items-center justify-center p-10 lg:max-w-7xl mx-auto relative">

        <div className="lg:w-1/2 lg:space-y-6 lg:px-10 relative font-[Georgia] z-10">

          <div className="flex gap-0 lg:gap-4">
            <img
              src={playstore}
              alt="playstore"
              className="w-30 h-15.5 mt-1 cursor-pointer"
            />

            <img
              src={appstore}
              alt="appstore"
              className="w-28 h-10.5 mt-3.5 cursor-pointer"
            />
          </div>

          <h1 className="text-4xl font-bold lg:text-6xl text-[#2b2118]">
            Here we{" "}
            <span className="text-[#9a4d2f]">serve</span> and deliver the{" "}
            <span className="text-[#8b3e24]">best snacks</span> and{" "}
            <span className="text-[#c45b2c]">small chops.</span>
          </h1>

          <p className="my-3 mb-7 text-[#4b382b] leading-relaxed">
            Delight your taste buds with some of the world best culinary
            delights. Place your orders, sit down and relax as we deliver your
            tasty snacks and drinks to your doorstep at lightning speed 😁.
          </p>

          <div className="flex gap-5 lg:gap-10">

            <Link
              to="/menu"
              className="
                text-white
                bg-[#2b2118]
                rounded-full
                px-6
                py-3
                cursor-pointer
                hover:bg-[#c45b2c]
                hover:scale-105
                transition-all
                duration-300
                shadow-md
              "
            >
              Place Your Orders
            </Link>

            <Link
              to="/contact"
              className="
                text-[#2b2118]
                border-[#2b2118]
                hover:bg-[#c45b2c]
                hover:text-white
                hover:border-[#c45b2c]
                border-2
                px-6
                py-3
                rounded-full
                cursor-pointer
                hover:scale-105
                transition-all
                duration-300
              "
            >
              Contact Us
            </Link>

          </div>
        </div>

        <div className="lg:w-1/2 w-[400px] relative">

          <img
            src={pizza}
            className="rounded-full mx-auto spin"
            alt="Food"
          />

          <div className="
            hidden lg:flex
            bg-[#3a2920]/95
            gap-2
            text-lg
            border-[#f2c6a0]
            border
            items-center
            absolute
            px-4
            py-2
            rounded-full
            lg:bottom-9
            lg:right-13.5
            shadow-lg
          ">
            <img
              src={alarm}
              alt="clock"
              className="w-12 h-10 lg:h-12"
            />

            <p className="leading-4 text-sm font-semibold text-white">
              Super Fast <br />
              Delivery
            </p>
          </div>

          <div className="
            hidden lg:flex
            bg-[#3a2920]/95
            gap-2
            text-lg
            border-[#f2c6a0]
            border
            items-center
            absolute
            px-4
            py-2
            rounded-full
            lg:bottom-79
            lg:right-15
            shadow-lg
          ">
            <img
              src={discount}
              alt="discount"
              className="w-12 h-10 lg:h-12"
            />

            <p className="leading-4 text-sm font-semibold text-white">
              5% Discount <br />
              on all order
            </p>
          </div>

          <div className="
            hidden lg:flex
            bg-[#3a2920]/95
            gap-2
            text-lg
            border-[#f2c6a0]
            border
            items-center
            absolute
            px-4
            py-2
            rounded-full
            lg:bottom-80
            lg:right-91
            shadow-lg
          ">
            <img
              src={cs}
              alt="customer service"
              className="w-12 h-10 lg:h-12"
            />

            <p className="leading-4 text-sm font-semibold text-white">
              24/7 Active <br />
              Customer Service
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Hero;
