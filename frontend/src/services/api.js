// const api = fetch({
//   baseUrl: import.meta.env.API_BASE_URL,
//   withCredentials: true,
// });

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response.status === 401) {
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body),
  put: (url, body) => request("PUT", url, body),
  delete: (url) => request("DELETE", url),
  upload: (url, formData) => uploadRequest(url, formData),
  patch: (url, body) => request("PATCH", url, body),
};

async function request(method, url, body = null) {
  const options = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${BASE_URL}${url}`, options);
  const data = await response.json();

  if (response.status === 401 && url !== "/auth/me" && url !== "/auth/login") {
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    throw { response: { data, status: response.status } };
  }

  return { data };
}

async function uploadRequest(url, formData) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    credentials: "include",
    // Do NOT set Content-Type — browser sets multipart/form-data with boundary
    body: formData,
  });
  const data = await response.json();

  if (response.status === 401) {
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    throw { response: { data, status: response.status } };
  }

  return { data };
}

export default api;

// ================= DOUBTS =================


// ================= ANSWERS =================


// ================= NOTIFICATIONS =================
