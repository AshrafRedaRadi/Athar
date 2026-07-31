import React from 'react'

export default function Email() {
    return (
        <div dir="rtl">
            <input className="input validator" type="email" required placeholder="mail@gmail.com" />
            <div className="validator-hint">أدخل بريدك الإلكتروني</div>
        </div>
    )
}
