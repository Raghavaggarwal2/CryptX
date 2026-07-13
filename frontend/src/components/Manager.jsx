import React, { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';


const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();

  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/passwords`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPasswordArray(data);
        } else {
          console.error("Failed to load passwords:", data);
        }
      })
      .catch(err => console.error("Error fetching passwords:", err));
  }, []);

  const copyText = (text) => {
    toast.success("Copied to clipboard");
    navigator.clipboard.writeText(text);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showPassword = () => {
    passwordRef.current.type = "text";
    if (
      ref.current.src ===
      "https://w7.pngwing.com/pngs/3/54/png-transparent-computer-icons-cross-eye-miscellaneous-logo-user-interface.png"
    ) {
      ref.current.src = "https://cdn-icons-png.flaticon.com/512/159/159078.png";
      passwordRef.current.type = "password";
    } else {
      ref.current.src =
        "https://w7.pngwing.com/pngs/3/54/png-transparent-computer-icons-cross-eye-miscellaneous-logo-user-interface.png";
      passwordRef.current.type = "text";
    }
  };

  const savePassword = async () => {
    if (
      form.site.length > 3 &&
      form.username.length > 3 &&
      form.password.length > 3
    ) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/passwords`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(form),
        });
        const newPassword = await response.json();
        setPasswordArray([...passwordArray, newPassword]);
        setForm({ site: "", username: "", password: "" });
        toast.success("Password saved successfully!");
      } catch (error) {
        console.error("Error saving password:", error);
      }
    } else {
      toast.error("Error: password not saved");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/passwords/${deleteId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPasswordArray(passwordArray.filter((item) => item.id !== deleteId));
      toast.success("Password Deleted!");
      setShowModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting password:", error);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  const editPassword = async (id) => {
    console.log("Edit", id);
    setForm(passwordArray.filter((item) => item.id === id)[0]);
    setPasswordArray(passwordArray.filter((item) => item.id !== id));
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/passwords/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error deleting old password during edit:", error);
    }
  };

  return (
    <>

      <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-300 opacity-20 blur-[100px]"></div>
      </div>
      <div className="mycontainer min-h-[81vh] py-10 pb-20">
        <h1 className="text-4xl mt-5 font-bold text-center">
          <span className="text-highlight1">&lt;</span>
          Crypt
          <span className="text-highlight1"> X/ &gt;</span>
        </h1>
        <p className="text-blue-900 text-lg text-center">
          Your own Password Manager
        </p>
        <div className="flex flex-col p-4 text-black gap-5 items-center">
          <input
            value={form.site}
            onChange={handleChange}
            className="rounded-full border border-blue-500 w-full p-4 py-1"
            placeholder="Enter Website URL"
            type="text"
            name="site"
          />
          <div className="flex flex-col md:flex-row w-full justify-between gap-8">
            <input
              value={form.username}
              onChange={handleChange}
              className="rounded-full border border-blue-500 w-full p-4 py-1"
              placeholder="Enter Username"
              type="text"
              name="username"
            />
            <div className="relative">
              <input
                ref={passwordRef}
                value={form.password}
                onChange={handleChange}
                className="rounded-full border border-blue-500 w-full p-4 py-1"
                placeholder="Enter Password"
                type="password"
                name="password"
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={showPassword}
              >
                <img
                  ref={ref}
                  src="https://cdn-icons-png.flaticon.com/512/159/159078.png"
                  className="w-5"
                  alt="eye"
                />
              </span>
            </div>
          </div>
          <button
            onClick={savePassword}
            className="btn-primary flex gap-2 justify-center items-center px-6 py-2 w-fit"
          >
            <lord-icon
              src="https://cdn.lordicon.com/jgnvfzqg.json"
              trigger="hover"
            ></lord-icon>
            Add Password
          </button>
        </div>
        <div className="passwords">
          <h2 className="font-bold text-2xl py-1 text-highlight1">Your Passwords</h2>
          {passwordArray.length === 0 && <div>No passwords to show</div>}
          {passwordArray.length !== 0 && (
            <div className="overflow-x-auto w-full mb-10">
            <table className="table-auto w-full min-w-[600px] rounded-md overflow-hidden">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="py-2">Site</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Password</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-blue-100">
                {passwordArray.map((item, idx) => {
                  return (
                    <tr key={idx}>
                      <td className="text-center border border-white py-2">
                        <div className="flex items-center justify-center gap-3">
                          <a href={item.site} target="_blank">
                            <span>{item.site}</span>
                          </a>
                          <div
                            className="lordiconcopy size-7 cursor-pointer"
                            onClick={() => {
                              copyText(item.site);
                            }}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="text-center border border-white py-2">
                        <div className="flex items-center justify-center gap-3">
                          <span>{item.username}</span>
                          <div
                            className="lordiconcopy size-7 cursor-pointer"
                            onClick={() => {
                              copyText(item.username);
                            }}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="text-center border border-white py-2">
                        <div className="flex items-center justify-center gap-3">
                          <span>{"*".repeat(item.password.length)}</span>
                          <div
                            className="lordiconcopy size-7 cursor-pointer"
                            onClick={() => {
                              copyText(item.password);
                            }}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="text-center border border-white py-2">
                        <span
                          className="cursor-pointer mx-1"
                          onClick={() => {
                            editPassword(item.id);
                          }}
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/gwlusjdu.json"
                            trigger="hover"
                            style={{ width: "25px", height: "25px" }}
                          ></lord-icon>
                        </span>
                        <span
                          className="cursor-pointer mx-1"
                          onClick={() => {
                            handleDelete(item.id);
                          }}
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/skkahier.json"
                            trigger="hover"
                            style={{ width: "25px", height: "25px" }}
                          ></lord-icon>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this password?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Manager;
