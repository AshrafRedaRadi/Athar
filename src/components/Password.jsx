function Password() {
    return (
        <div dir="rtl">
            <label className="text-base-content">كلمة المرور</label>
            <input type="password" className="input validator" required placeholder="كلمة المرور" minLength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must be more than 8 characters, including number, lowercase letter, uppercase letter" />
            <p className="validator-hint">
                Must be more than 8 characters, including
                <br />At least one number
                <br />At least one lowercase letter
                <br />At least one uppercase letter
            </p>
        </div>
    )
}
export default Password;