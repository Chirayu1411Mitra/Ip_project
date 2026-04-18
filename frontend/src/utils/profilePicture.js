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

  const picture = user.profilePicture ?? user.avatarURL ?? null;

  if (!picture) return null;

  if (typeof picture === "string") {
    return picture;
  }

  if (typeof picture === "object" && picture.contentType && picture.data) {
    const base64 = toBase64(picture.data);
    if (!base64) return null;

    return `data:${picture.contentType};base64,${base64}`;
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
