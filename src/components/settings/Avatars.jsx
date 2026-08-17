import { GrClose } from "react-icons/gr";
import styles from "../../modules/avatars.module.css";
import useAxiosGet from "../../hooks/useAxiosGet";
import axios from "axios";
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
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "https://atharai.runasp.net/api/Account/avatar",
        {
          avatarId: avatarId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setShowAvatars(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      window.location.reload();
    }
  };
  const { data } = useAxiosGet("/api/Avatars");
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
          {data.data?.map((avatar) => (
            <img
              key={avatar.id}
              src={`https://atharai.runasp.net${avatar.imageUrl}`}
              alt={avatar.name}
              onClick={() => handleAvatarChange(avatar.id)}
              className="h-16 w-16 rounded-full border-2 border-cyan-700 dark:border-cyan-500 object-cover shadow-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Avatars;
