import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [wishes, setWishes] = useState([]);
  const [title, setTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const api = axios.create({ baseURL: "https://wishes-bm52.onrender.com/api" });

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    if (token) fetchWishes();
  }, [token]);

  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const login = async () => {
    try {
      const res = await api.post("/auth/login", authForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      setToken(res.data.token);
      setUsername(res.data.username);
      toast.success("Login successful!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  const register = async () => {
    try {
      await api.post("/auth/register", authForm);
      toast.success("User created! Please login.");
      setAuthMode("login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Register failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken("");
    setUsername("");
    setWishes([]);
    toast("Logged out successfully");
  };

  const fetchWishes = async () => {
    try {
      const res = await api.get("/wishes", { headers: { Authorization: `Bearer ${token}` } });
      setWishes(res.data);
    } catch (err) {
      toast.error("Failed to fetch wishes");
    }
  };

  const addWish = async () => {
    if (!title.trim()) return;
    try {
      await api.post("/wishes", { title }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle("");
      fetchWishes();
      toast.success("Wish added!");
    } catch (err) {
      toast.error("Failed to add wish");
    }
  };

  const startEdit = (wish) => { setTitle(wish.title); setEditId(wish._id); setEditMode(true); };
  
  const updateWish = async () => {
    if (!title.trim()) return;
    try {
      await api.put(`/wishes/${editId}`, { title }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle(""); setEditMode(false); setEditId(null); fetchWishes();
      toast.success("Wish updated!");
    } catch (err) {
      toast.error("Failed to update wish");
    }
  };

  const deleteWish = async (id) => {
    try {
      await api.delete(`/wishes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchWishes();
      toast.success("Wish deleted!");
    } catch (err) {
      toast.error("Failed to delete wish");
    }
  };

  const completeWish = async (id) => {
    try {
      await api.patch(`/wishes/${id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchWishes();
      toast.success("Wish marked as completed!");
    } catch (err) {
      toast.error("Failed to complete wish");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-200 flex flex-col items-center justify-center p-6">
        <Toaster position="top-right" reverseOrder={false} />
        <h1 className="text-4xl font-bold mb-6 text-indigo-400">{authMode === "login" ? "Login" : "Register"}</h1>
        <input
          name="username"
          placeholder="Username"
          value={authForm.username}
          onChange={handleAuthChange}
          className="p-3 mb-4 w-full max-w-sm rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={authForm.password}
          onChange={handleAuthChange}
          className="p-3 mb-4 w-full max-w-sm rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        {authMode === "login" ? (
          <button
            onClick={login}
            className="w-full max-w-sm py-3 mb-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg transition font-medium"
          >
            Login
          </button>
        ) : (
          <button
            onClick={register}
            className="w-full max-w-sm py-3 mb-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg transition font-medium"
          >
            Register
          </button>
        )}
        <button
          onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
          className="text-sm text-gray-400 hover:text-gray-200 mt-2"
        >
          {authMode === "login" ? "Create account" : "Back to login"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200 p-6 md:p-10 font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12">
        <button className="bg-[#752626] hover:bg-red-800 transition px-5 py-1 rounded-lg shadow-md w-full md:w-auto" onClick={logout}>Logout</button>
        <h1 className="text-3xl md:text-5xl font-bold text-indigo-400 mt-6 md:mb-0">Wishlist - {username}</h1>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add new wish"
          className="flex-1 p-3 rounded-lg bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <button
          onClick={editMode ? updateWish : addWish}
          className="bg-indigo-600 hover:bg-indigo-700 transition px-6 py-2 rounded-lg shadow-md font-medium"
        >
          {editMode ? "Update" : "Add"}
        </button>
        {editMode && (
          <button
            onClick={() => { setEditMode(false); setEditId(null); setTitle(""); }}
            className="px-5 py-3 bg-gray-700 hover:bg-gray-600 transition rounded-lg shadow-md"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Wishes</h2>
          <ul className="space-y-3">
            {wishes.filter(w => !w.completed).map((wish, index) => (
              <li key={wish._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-2xl transition">
                <span className="text-gray-200 font-medium">{index+1}. {wish.title}</span>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => startEdit(wish)}
                    className="px-4 py-1 min-w-[70px] bg-[#a16901] hover:bg-yellow-600 rounded-lg transition font-medium truncate"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteWish(wish._id)}
                    className="px-4 py-1 min-w-[70px] bg-[#752626] hover:bg-red-800 rounded-lg text-white transition font-medium truncate"
                    title="Delete"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => completeWish(wish._id)}
                    className="px-4 py-1 min-w-[70px] bg-[#195319] hover:bg-green-800 rounded-lg text-white transition font-medium truncate"
                    title="Complete"
                  >
                    Complete
                  </button>
                </div>
              </li>
            ))}
            {wishes.filter(w => !w.completed).length === 0 && <p className="text-gray-400">No pending wishes.</p>}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Completed Wishes</h2>
          <ul className="space-y-3">
            {wishes.filter(w => w.completed).map((wish, index) => (
              <li key={wish._id} className="flex justify-between items-center bg-gray-700 p-4 rounded-xl shadow-md">
                <span className="line-through text-gray-400 font-medium">{index+1}. {wish.title}</span>
                <button onClick={() => deleteWish(wish._id)} className="px-3 py-1 bg-[#752626] hover:bg-red-800 rounded-lg text-white transition font-medium">Delete</button>
              </li>
            ))}
            {wishes.filter(w => w.completed).length === 0 && <p className="text-gray-400">No completed wishes yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
