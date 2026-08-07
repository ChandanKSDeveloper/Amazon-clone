import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminSidebar from "../../components/AdminSidebar";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  X,
  AlertCircle,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

import Pagination from "../../components/common/Pagination.jsx";
import {
  amazonClasses,
  amazonInput,
  amazonPrimaryBtn,
  amazonSelect,
} from "../../constants/amazonClasses.js";
import AmazonSpinner from "../../components/products/AmazonSpinner";
import {
  getAllUsersAdmin,
  updateUserRole,
  deleteUser,
} from "../../redux/slices/userSlice";

export default function AdminUsers() {
  const dispatch = useDispatch();

   const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get("page")) || 1;

  const {
    users,
    adminLoading,
    error,
    user: currentUser,
    currentPage,
    totalPages,
    usersCount,
    resultPerPage,
  } = useSelector((state) => state.user);

   useEffect(() => {
    dispatch(getAllUsersAdmin({ page: urlPage, limit: 10 }));
  }, [dispatch, urlPage]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [updating, setUpdating] = useState(false);

 const handlePageChange = (page) => {
    setSearchParams({ page: page });
  };
  
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
    });
  };

  const handleCloseEdit = () => {
    setSelectedUser(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and Email are required fields.");
      return;
    }

    setUpdating(true);
    try {
      await dispatch(
        updateUserRole({ id: selectedUser._id, payload: editForm }),
      ).unwrap();
      toast.success("User configuration updated successfully!");
      setSelectedUser(null);
    } catch (err) {
      toast.error(err || "Failed to update user.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser?._id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success(`User "${name}" deleted successfully.`);
      } catch (err) {
        toast.error(err || "Failed to delete user.");
      }
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#EAEDED]">
        <AdminSidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131921]">
              Manage Users
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Verify customer databases, modify user authorizations, or remove
              obsolete accounts.
            </p>
          </div>

          {adminLoading && users.length === 0 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <AmazonSpinner />
                <p className="text-sm text-gray-600">
                  Retrieving user roster...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4 text-red-700">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Users</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className={`${amazonClasses.cardBase} p-12 text-center`}>
              <p className="text-gray-600">No registered users found.</p>
            </div>
          ) : (
            <div className={`${amazonClasses.cardBase} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-4 px-6">Avatar</th>
                      <th className="py-4 px-6">Profile Details</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Access Level</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((userObj) => (
                      <tr
                        key={userObj._id}
                        className="text-gray-700 hover:bg-gray-50 transition"
                      >
                        {/* Avatar */}
                        <td className="py-4 px-6">
                          {userObj.avatar?.url ? (
                            <img
                              src={userObj.avatar.url}
                              alt={userObj.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#232F3E] text-[#FF9900] flex items-center justify-center text-sm font-bold">
                              {userObj.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </td>

                        {/* Name & ID */}
                        <td className="py-4 px-6">
                          <h4 className="font-semibold text-[#131921] flex items-center gap-2">
                            {userObj.name}
                            {userObj._id === currentUser?._id && (
                              <span className="text-[10px] bg-[#FF9900] text-[#131921] font-bold px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {userObj._id}
                          </p>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 font-medium text-gray-700">
                          {userObj.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6">
                          {userObj.role === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#232F3E] text-[#FF9900] border border-[#131921]">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span>Administrator</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Standard User</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(userObj)}
                              className={`${amazonClasses.iconBtn} h-9 w-9 hover:bg-[#F0F8FF] hover:border-[#007185] hover:text-[#007185]`}
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteUser(userObj._id, userObj.name)
                              }
                              disabled={userObj._id === currentUser?._id}
                              className={`${amazonClasses.iconBtn} h-9 w-9 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

               <div className="px-6 pb-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}

          {/* Edit User Modal Overlay */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div
                className={`${amazonClasses.cardBase} w-full max-w-md shadow-xl rounded-lg`}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-extrabold text-[#131921] text-lg">
                      Modify Account Profile
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Admin-override panel for access authorization
                    </p>
                  </div>
                  <button
                    onClick={handleCloseEdit}
                    className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                      className={amazonInput}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                      className={amazonInput}
                    />
                  </div>

                  {/* Role Select */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="role"
                      className="text-xs font-semibold text-gray-700 uppercase"
                    >
                      Access Authorization
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={editForm.role}
                      onChange={handleEditChange}
                      disabled={selectedUser._id === currentUser?._id}
                      className={amazonSelect}
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    {selectedUser._id === currentUser?._id && (
                      <p className="text-[11px] text-amber-600 font-medium mt-1">
                        To protect operations, you cannot revoke your own admin
                        clearance.
                      </p>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-gray-200 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      className={`${amazonClasses.btnSecondary} px-5 py-2`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className={`${amazonPrimaryBtn} w-auto px-5 flex items-center gap-1.5`}
                    >
                      {updating && <AmazonSpinner className="h-4 w-4" />}
                      <span>Apply Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
