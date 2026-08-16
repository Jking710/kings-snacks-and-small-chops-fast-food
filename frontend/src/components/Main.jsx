import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";

import ch1 from "../assets/ch1.jpg";
import ch2 from "../assets/ch2.jpg";
import ch3 from "../assets/ch3.jpg";
import ch4 from "../assets/ch4.jpg";
import ch5 from "../assets/ch5.jpg";
import ch6 from "../assets/ch6.jpg";
import ch7 from "../assets/ch7.jpg";
import ch8 from "../assets/ch8.jpg";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

function Main() {
  return (
<div
  className="py-12 px-5 lg:px-0 lg:py-20 bg-cover bg-center bg-no-repeat relative"
  style={{
    backgroundImage: `
      linear-gradient(
        rgba(250, 249, 246, 0.68),
        rgba(250, 249, 246, 0.68)
      ),
      url("https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=2000&q=85")
    `,
  }}
>
      <div className="w-full max-w-7xl mx-auto">

        <Swiper
          spaceBetween={20}
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper rounded-2xl shadow-2xl  overflow-hidden"
        >
          {[ch2, ch3, ch4, ch5, ch6, ch7, ch8].map((img, i) => (
            <SwiperSlide key={i}>
              <div
                style={{ backgroundImage: `url(${img})` }}
                className="h-[180px] sm:h-[340px] md:h-[440px] lg:h-[600px] w-full bg-cover bg-center"
              />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>

      <div className="text-center mt-12">
        <Link to="/menu">
          <button
            className="
              px-12 sm:px-20 lg:px-28
              py-4
              bg-[#1c1917]
              text-white
              font-semibold
              tracking-wide
              rounded-full
              shadow-lg
              hover:bg-orange-500
              hover:shadow-xl
              hover:scale-105
              transition-all
              duration-300
              cursor-pointer
            "
          >
            Check out our menu
          </button>
        </Link>
      </div>

    </div>
  );
}

export default Main;

