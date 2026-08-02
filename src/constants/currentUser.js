import userAvatar from "../assets/user.png";
import logoImg from "../assets/logo.png";

/**
 * Fallback user defaults for Athar platform.
 * Dynamic user data is now fetched from Backend API (`/api/Account/profile`) via `AuthContext`.
 */
export const CURRENT_USER = {
  name: "ضيف أثر",
  avatar: userAvatar,
  logo: logoImg,
};
