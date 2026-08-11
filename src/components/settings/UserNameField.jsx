function UserNameField() {
  return (
    <div className="w-full">
      <label htmlFor="user-name" className="mb-2 block text-sm text-base-content">
        اسم المستخدم
      </label>

      <input
        id="user-name"
        type="text"
        name="userName"
        placeholder="اكتب اسم المستخدم"
        className="input h-12 w-full rounded-xl border-base-300 bg-base-100 text-right text-base-content placeholder:text-base-content/40"
      />
    </div>
  );
}

export default UserNameField;
