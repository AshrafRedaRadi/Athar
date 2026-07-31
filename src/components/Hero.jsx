import React from 'react'

export default function Hero(props) {
    return (
        <div>
            <div className="hero bg-linear-65 from-olive-500 to-base-200 max-w-[95%] mt-10 p-2 rounded-xl mx-auto">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <img
                        src={props.img}
                        className="max-w-45 bg-cover rounded-lg shadow-2xl"
                    />
                    <div>
                        <h1 className="text-5xl font-bold" dir="rtl">
                            {props.title}
                        </h1>
                        <p className="py-6" dir="rtl">
                            {props.description}
                        </p>
                        <button className="rounded-lg bg-olive-200 px-2 py-1 text-neutral" dir="rtl">
                            {props.reminder}
                        </button>
                    </div>
                </div>
            </div>
        </div> 
  );
}
