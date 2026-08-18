import React from "react";
import defaultAvatar from "../../assets/user.png";

/**
 * Avatar – reusable profile picture component.
 *
 * @param {string}  src   - image source URL
 * @param {string}  size  - Tailwind width class (default: "w-12")
 * @param {string}  alt   - alt text (default: "User")
 */
function Avatar({ src, size = "w-12", alt = "User" }) {
  return (
    <div className="avatar shrink-0">
      <div
        className={`${size} rounded-full ring ring-cyan-700 hover:ring-cyan-700 dark:ring-cyan-400 ring-offset-1 ring-offset-base-100 overflow-hidden`}
      >
        <img
          src={src || defaultAvatar}
          alt={alt}
          onError={(e) => {
            e.currentTarget.src = defaultAvatar;
          }}
        />
      </div>
    </div>
  );
}

export default Avatar;
