import api from "./api";

const register = async ({
  name,
  email,
  password,
  rollNo,
  semester,
  branch,
}) => {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
    rollNo,
    semester: Number(semester),
    branch,
  });
  return data;
};

const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    console.log("Login response:", response);
    const { data } = response;
    console.log("Login data:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

const logout = async () => {
  await api.post("/auth/logout");
};

const deleteAccount = async () => {
  await api.delete("/auth/delete-account");
};

const authService = { register, login, getMe, logout, deleteAccount };
export default authService;
