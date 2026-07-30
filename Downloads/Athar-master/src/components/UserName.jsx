function UserName() {
    return (
        <div dir="rtl">
            <label className="text-base-content">البريد الإلكتروني أو اسم المستخدم</label>
            <input type="text" className="input validator" required placeholder="ادخل البريد الإلكتروني أو اسم المستخدم"
                pattern="[A-Za-z][A-Za-z0-9\-]*" minLength="3" maxLength="30" title="Only letters, numbers or dash" />
            <p className="validator-hint">
                يجب أن لا يقل اسم المستخدم عن 3 حروف ولا يزيد عن 30 حرف
                <br />يحتوي فقط على حروف و أرقام و شرطه (-)
            </p>
        </div>
    )
}
export default UserName;