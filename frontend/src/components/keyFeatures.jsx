import React from "react";
import chef2 from "../assets/Chefburger.json";
import playstore from "../assets/playstore.png";
import appstore from "../assets/appstore.png";
import Lottie from "lottie-react";

function keyFeatures() {
  return (
    <div className="bg-orange-50 py-10 px-4 lg:px-0 lg:py-20">
      <div className="flex flex-col  lg:flex-row  max-w-7xl mx-auto">
        <div className="lg:w-1/2 flex items-center justify-center">
          <Lottie animationData={chef2} className="w-[450px]" />
        </div>

        <div className="lg:w-1/2 mt-12 flex flex-col space-y-3 lg:space-y-7 justify-center ">
          <h2 className="text-orange-600 mb-5 font-semibold text-sm lg:text-xl">
            KEY FEATURES
          </h2>
          <h1 className=" text-3xl lg:text-[43px] font-bold">
            <span className="text-orange-600">Enjoy</span> a{" "}
            <span className="text-rose-900">Top-Notch</span> and{" "}
            <span className="text-orange-600">Flawless</span> Ordering{" "}
            <span className="text-rose-900">Experience</span>
          </h1>
          <p>
            We offer quality services and fast delivery, giving you access to a
            wide range of tasty snacks that will give you that satisfaction that
            you crave, desire and deserve.
          </p>
          <div className="flex gap-0 lg:gap-3 pt-4">
            <img
              src={playstore}
              alt="Image Not Found"
              className="w-30 h-15.5 cursor-pointer"
            />
            <img
              src={appstore}
              alt="Image Not Found"
              className="w-28 h-10.5 mt-2.5 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default keyFeatures;
