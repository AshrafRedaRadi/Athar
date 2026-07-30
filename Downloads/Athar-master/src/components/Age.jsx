function Age() {
    return (
        <div dir="rtl">
            <label className="text-base-content">السن</label>
            <input type="number" className="input validator bg-cyan-700 text-white" required placeholder="السن"
                min="5" max="100" title="العمر" />
            <p className="validator-hint">
                العمر من خمس سنوات فأكثر
            </p>
        </div>
    )
}
export default Age;