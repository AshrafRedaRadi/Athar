import { GrClose } from "react-icons/gr";
import styles from "../../modules/avatars.module.css";
import useAxiosGet from "../../hooks/useAxiosGet";
import { apiFetch, API_BASE_URL } from "../../api/client";
import { useState } from "react";

const Avatars = ({ setShowAvatars }) => {
  const [close, setClose] = useState(false);
  const handleClose = () => {
    setClose(true);

    setTimeout(() => {
      setShowAvatars(false);
    }, 200);
  };
  const handleAvatarChange = async (avatarId) => {
    try {
      await apiFetch("/api/Account/avatar", {
        method: "PUT",
        body: JSON.stringify({ avatarId }),
      });

      setShowAvatars(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      window.location.reload();
    }
  };
  const { data } = useAxiosGet("/api/Avatars");
  const avatarsList = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className={`${styles.avatars}`}>
      <div
        className={`${styles.avatarsContainer} ${close ? styles["scale-down-right"] : styles["scale-up-br"]} bg-base-100`}
      >
        <button
          onClick={() => handleClose()}
          className={styles.closeBtn}
        >
          <GrClose />
        </button>
        <div>
          {avatarsList.map((avatar) => (
            <img
              key={avatar.id}
              src={avatar.imageUrl?.startsWith("http") ? avatar.imageUrl : `${API_BASE_URL}${avatar.imageUrl}`}
              alt={avatar.name}
              onClick={() => handleAvatarChange(avatar.id)}
              className="h-16 w-16 rounded-full border-2 border-cyan-700 dark:border-cyan-500 object-cover shadow-md cursor-pointer hover:scale-105 transition-transform"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Avatars;
