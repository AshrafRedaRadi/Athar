function Gender() {
    return (
        <>
            <div dir="rtl" className="form-control btn bg-cyan-700 rounded-xl hover:bg-cyan-700 w-50">
                <label className="label cursor-pointer justify-start gap-2">
                    <input
                        type="radio"
                        name="gender"
                        value="male"
                        className="radio radio-info"
                        required
                    />
                    <span className="label-text text-white ml-4">ذكر</span>
                </label>
           
                <label className="label cursor-pointer justify-start gap-2">
                    <input
                        type="radio"
                        name="gender"
                        value="female"
                        className="radio radio-info"
                        required
                    />
                    <span className="label-text text-white">أنثى</span>
                </label>

                <p className="validator-hint">Please select a gender.</p>
            </div>
        </>
    );
}
export default Gender;