import { useTheme } from "../../hooks/useTheme";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  cupcake: "Cupcake",
  bumblebee: "Bumblebee",
  emerald: "Emerald",
  corporate: "Corporate",
  synthwave: "Synthwave",
  retro: "Retro",
  cyberpunk: "Cyberpunk",
  valentine: "Valentine",
  halloween: "Halloween",
  garden: "Garden",
  forest: "Forest",
  aqua: "Aqua",
  lofi: "Lofi",
  pastel: "Pastel",
  fantasy: "Fantasy",
  wireframe: "Wireframe",
  black: "Black",
  luxury: "Luxury",
  dracula: "Dracula",
  cmyk: "CMYK",
  autumn: "Autumn",
  business: "Business",
  acid: "Acid",
  lemonade: "Lemonade",
  night: "Night",
  coffee: "Coffee",
  winter: "Winter",
  dim: "Dim",
  nord: "Nord",
  sunset: "Sunset",
  caramellatte: "Caramellatte",
  abyss: "Abyss",
  silk: "Silk",
};

function ThemeSwitcher() {
  const { theme, themes, setTheme } = useTheme();

  return (
    <div className="dropdown w-full">
      <div
        tabIndex={0}
        role="button"
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-base-300 bg-base-100 px-4 text-sm text-base-content"
      >
        <span>{themeLabels[theme] || theme}</span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 2048 2048"
          className="fill-current opacity-60"
          aria-hidden="true"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </div>

      <ul
        tabIndex="-1"
        className="dropdown-content z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-box bg-base-300 p-2 shadow-2xl"
      >
        {themes.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => setTheme(item)}
              className={`w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-base-100 ${
                theme === item ? "bg-base-100 font-medium" : ""
              }`}
            >
              {themeLabels[item] || item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ThemeSwitcher;
