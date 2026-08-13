import React from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorImage from '../assets/Error.jpg'

export default function Error_page() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4 bg-[#2d5d73] select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex items-center justify-center scale-110">
        <img
          src={ErrorImage}
          alt="عذراً حدث خطأ 404"
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain block mx-auto select-none"
        />

        <div className="absolute bottom-[13%] left-[32%] right-[32%] flex justify-between items-center h-[6%]">
          <button
            onClick={() => navigate(-1)}
            title="الذهاب إلى الصفحة السابقة"
            className="w-[46%] h-full cursor-pointer rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent hover:bg-white/15 border border-transparent hover:border-white/30 hover:shadow-md outline-none"
          />

          <button
            onClick={() => navigate('/')}
            title="الرجوع إلى الصفحة الرئيسية"
            className="w-[46%] h-full cursor-pointer rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent hover:bg-white/15 border border-transparent hover:border-white/30 hover:shadow-md outline-none"
          />
        </div>
      </div>
    </div>
  )
}