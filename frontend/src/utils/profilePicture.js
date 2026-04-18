const toBase64 = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    let binary = "";
    const chunkSize = 0x8000;

    for (let index = 0; index < value.length; index += chunkSize) {
      const chunk = value.slice(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }

  if (value?.data && Array.isArray(value.data)) {
    return toBase64(value.data);
  }

  return null;
};

export const getProfilePictureSrc = (user) => {
  if (!user) return null;

  // First, check if avatarURL is already a base64 data URI
  const avatarURL = user.avatarURL || user.profilePicture;
  if (
    avatarURL &&
    typeof avatarURL === "string" &&
    avatarURL.startsWith("data:")
  ) {
    return avatarURL;
  }

  // Fallback to string-based avatarURL
  if (avatarURL && typeof avatarURL === "string") {
    return avatarURL;
  }

  // Check for binary object format (shouldn't happen with new backend, but keep for compatibility)
  if (
    avatarURL &&
    typeof avatarURL === "object" &&
    avatarURL.contentType &&
    avatarURL.data
  ) {
    const base64 = toBase64(avatarURL.data);
    if (!base64) return null;
    return `data:${avatarURL.contentType};base64,${base64}`;
  }

  // Check for profileImage object
  if (
    user.profileImage &&
    typeof user.profileImage === "object" &&
    user.profileImage.contentType &&
    user.profileImage.data
  ) {
    const base64 = toBase64(user.profileImage.data);
    if (!base64) return null;
    return `data:${user.profileImage.contentType};base64,${base64}`;
  }

  return null;
};

export const normalizeUser = (user) => {
  if (!user) return null;

  const profilePicture = getProfilePictureSrc(user);

  return {
    ...user,
    profilePicture,
    avatarURL: profilePicture ?? user.avatarURL ?? null,
  };
};
