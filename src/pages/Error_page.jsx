import React from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorImage from '../assets/Error.png'

export default function Error_page() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-[#2a5c73] ">
      
      <div className="relative inline-block max-w-2xl w-full ">
        
        <img 
          src={ErrorImage} 
          alt="عذراً حدث خطأ 404" 
          className="w-full h-auto object-contain block mx-auto drop-shadow-2xl select-none" 
        />  

        <div className="absolute bottom-[11%] left-[32%] right-[32%] flex justify-between items-center h-[9%]">
          
          <button 
            onClick={() => navigate(-1)}
            title="الذهاب الي الصفحة السابقة"
            className="w-[46%] h-full cursor-pointer  transition-transform duration-200 hover:scale-105 active:scale-95 bg-transparent border-none outline-none"
          />

          <button 
            onClick={() => navigate('/')}
            title="الرجوع إلى الصفحة الرئيسية"
            className="w-[46%] h-full cursor-pointer transition-transform duration-200  bg-transparent border-none outline-none"
          />

        </div>

      </div>
    </div>
  )
}