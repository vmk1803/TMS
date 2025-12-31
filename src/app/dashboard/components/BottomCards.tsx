"use client";
import React from "react";
import { Car, MapPin, Map, FileText } from "lucide-react";
import { useRouter } from "next/navigation"; 
const cards = [
  { title: "Tech Routes", icon: Car, desc: "Optimize daily technician schedules and routes for maximum operational efficiency.", img: "images/dashboard/techrouts.png" },
  { title: "Travel Mileage", icon: MapPin, desc: "Ensure compliance and accurate cost reporting with automated mileage tracking.", img: "images/dashboard/travelMileage.png" },
  { title: "Dispatch Map", icon: Map, desc: "Monitor technician live locations and order progress on the interactive map.", img: "images/dashboard/dispatchMap.png" },
  { title: "EMR Orders", icon: FileText, desc: "Seamlessly process all digital lab requisitions through direct EMR integration.", img: "images/dashboard/emrOrder.png" },
];

const BottomCards = () => {
   const router = useRouter();
  return (
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {cards.map((item, i) => (
        <div
          key={i}
          className="relative rounded-2xl overflow-hidden shadow-sm group"
               onClick={() => {
            if (item.title === "Tech Routes") {
              router.push("/techrouts");  
            }     
                if (item.title === "Travel Mileage") {
              router.push("/travelMielage");   
            }
          }}
            
        >
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all flex flex-col justify-end p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="w-5 h-5" />
              <h4 className="font-semibold">{item.title}</h4>
            </div>
            <p className="text-xs text-gray-200">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BottomCards;
