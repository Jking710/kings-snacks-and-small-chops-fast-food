import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Quote, Star } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Autoplay, Pagination } from "swiper/modules";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Wealth",
      rating: 5,
      text: "The taste of the snacks were top notch quality and worth every penny. I really enjoyed the snacks I ordered and it wasn't expensive.",
    },
    {
      id: 2,
      name: "Linda Thompson",
      rating: 4,
      text: "Excellent service, what I ordered was delivered on time and it was exactly what I ordered, it was packaged well and was hot and tasty.",
    },
    {
      id: 3,
      name: "Deborah John ",
      rating: 4,
      text: "I had a wonderful ordering experience! The fusion of flavors in their signature snacks is truly unique and delightful, I loved every bite, I took.",
    },
    {
      id: 4,
      name: "Terry Smith",
      rating: 5,
      text: "Love everything about fast-food, the customer service superb, the snacks amazing and delightful, I was satisfied with what I bought.",
    },
    {
      id: 5,
      name: "Liam Johnson",
      rating: 5,
      text: "I've ordered from various snack vendors and fast-food places, but this one stands out. The ambiance, the service, and most importantly, the snacks are exquisite and delightful.",
    },
  ];

  return (
    <div className="py-10 px-4 lg:px-0">
      <h1 className="text-center text-3xl lg:text-4xl font-bold text-orange-600">
        Customers Reviews
      </h1>
      <div className="max-w-6xl mx-auto py-10 px-3">
        <Swiper
        style={{
            "--swiper-pagination-color": "#EF4444",
            "--swiper-pagination-bullet-inactive-color": "#999999",
            "--swiper-pagination-bullet-inactive-opacity": "1",
            "--swiper-pagination-bullet-size": "10px",
            "--swiper-pagination-bullet-horizontal-gap": "6px"
        }}
          modules={[Pagination, Autoplay]} 
          loop={true}
          speed={600}
          autoplay={{ delay: 5000 }}
          slidesPerView={3}
          spaceBetween={30}
          breakpoints={{
            320: { slidesPerView: 1 },
            480: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true,
          }}
          className="mySwiper"
        >
          {
         testimonials.map((item)=> {
            return <SwiperSlide key={item.id}>
                <div className="border border-gray-400 shadow-md shadow-orange-500 rounded-lg flex flex-col p-4">
                    {
                        item.rating === 4 ? (<div className="flex">
                            <Star fill= "true"/>
                            <Star fill= "true"/>
                            <Star fill= "true"/>
                            <Star fill= "true"/>
                            <Star   />
                            </div>):(<div className="flex">
                            <Star fill= "true"/>
                            <Star fill= "true"/>
                            <Star fill= "true"/>
                            <Star fill= "true"/>
                            <Star fill="true" />
                            </div>)
                    }
                    <p className="py-3">{item.text}</p>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-rose-700">{item.name}</h3>
                            <p className="text-sm mt-1">CEO, Johnny King</p>
                        </div>
                        <Quote className="text-rose-700"/>
                    </div>
                </div>
            </SwiperSlide>
         })
         }
           <div className='swiper-pagination my-10 gap-1 ' style={{ position: 'static', marginTop: '40px' }}></div>
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonials;
