import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [authMode, setAuthMode] = useState("login"); // login/register
  const [authForm, setAuthForm] = useState({ username: "", password: "" });

  const [wishes, setWishes] = useState([]);
  const [title, setTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const api = axios.create({ baseURL: "http://localhost:5000/api" });

  // Load token & username from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  // Fetch wishes when token changes
  useEffect(() => {
    fetchWishes();
  }, [token]);

  // Auth Handlers
  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const login = async () => {
    try {
      const res = await api.post("/auth/login", authForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      setToken(res.data.token);
      setUsername(res.data.username);
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const register = async () => {
    try {
      await api.post("/auth/register", authForm);
      alert("User created! Please login.");
      setAuthMode("login");
    } catch (err) {
      alert(err.response?.data?.error || "Register failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken("");
    setUsername("");
    setWishes([]);
  };

  // Wishlist Handlers
  const fetchWishes = async () => {
    if (!token) return;
    try {
      const res = await api.get("/wishes", { headers: { Authorization: `Bearer ${token}` } });
      setWishes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addWish = async () => {
    if (!title.trim()) return;
    try {
      await api.post("/wishes", { title }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle("");
      fetchWishes();
    } catch (err) { console.error(err); }
  };

  const startEdit = (wish) => { setTitle(wish.title); setEditId(wish._id); setEditMode(true); };
  const updateWish = async () => {
    if (!title.trim()) return;
    await api.put(`/wishes/${editId}`, { title }, { headers: { Authorization: `Bearer ${token}` } });
    setTitle(""); setEditMode(false); setEditId(null); fetchWishes();
  };
  const deleteWish = async (id) => { await api.delete(`/wishes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchWishes(); };
  const completeWish = async (id) => { await api.patch(`/wishes/${id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchWishes(); };

  // Render login/register form if not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl mb-4 text-indigo-400">{authMode === "login" ? "Login" : "Register"}</h1>
        <input name="username" placeholder="Username" value={authForm.username} onChange={handleAuthChange} className="p-2 mb-2 w-64 rounded bg-gray-800 text-gray-200" />
        <input type="password" name="password" placeholder="Password" value={authForm.password} onChange={handleAuthChange} className="p-2 mb-2 w-64 rounded bg-gray-800 text-gray-200" />
        {authMode === "login" ? 
          <button onClick={login} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 transition">Login</button> :
          <button onClick={register} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 transition">Register</button>
        }
        <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="mt-2 text-sm text-gray-400 hover:text-gray-200">
          {authMode === "login" ? "Create account" : "Back to login"}
        </button>
      </div>
    );
  }

  // Render Wishlist when logged in
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8 font-sans">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-indigo-400">Wishlist - {username} </h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition">Logout</button>
      </div>

      <div className="flex justify-center mb-8">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Add new wish" className="p-2 w-72 rounded-l bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        <button onClick={editMode ? updateWish : addWish} className="bg-indigo-600 px-4 py-2 rounded-r hover:bg-indigo-700 transition">{editMode ? "Update" : "Add"}</button>
        {editMode && <button onClick={()=>{setEditMode(false); setEditId(null); setTitle("")}} className="ml-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">Cancel</button>}
      </div>

      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Wishes</h2>
        <ul className="space-y-2 mb-8">
          {wishes.filter(w=>!w.completed).map((wish,index)=>(
            <li key={wish._id} className="flex justify-between items-center bg-gray-800 p-3 rounded shadow">
              <span>{index+1}. {wish.title}</span>
              <div className="space-x-2">
                <button onClick={()=>startEdit(wish)} className="px-2 py-1 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 transition">Edit</button>
                <button onClick={()=>deleteWish(wish._id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
                <button onClick={()=>completeWish(wish._id)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition">Complete</button>
              </div>
            </li>
          ))}
          {wishes.filter(w=>!w.completed).length===0 && <p className="text-gray-400">No pending wishes.</p>}
        </ul>

        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Completed Wishes</h2>
        <ul className="space-y-2">
          {wishes.filter(w=>w.completed).map((wish,index)=>(
            <li key={wish._id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
              <span className="line-through text-gray-400">{index+1}. {wish.title}</span>
              <button onClick={()=>deleteWish(wish._id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
            </li>
          ))}
          {wishes.filter(w=>w.completed).length===0 && <p className="text-gray-400">No completed wishes yet.</p>}
        </ul>
      </div>
    </div>
  );
}

export default App;
