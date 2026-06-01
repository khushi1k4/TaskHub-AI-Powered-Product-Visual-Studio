"use client";

import { useState, useEffect } from "react";
import { UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

export default function CreateTaskPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    task_title: '',
    description: '',
    assigned_user_email: '',
    due_date: '',
    product_name: '',
    gender: 'male',
  });

  useEffect(() => {
    api.get('/auth/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to load users:", err));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Product image is required");
      return;
    }
    if (!formData.assigned_user_email) {
      toast.error("Please assign a user");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = new FormData();
      data.append('product_name', formData.product_name);
      data.append('task_title', formData.task_title);
      // data.append('description', formData.description);
      data.append('gender', formData.gender);
      data.append('assigned_user_email', formData.assigned_user_email);
      data.append('due_date', formData.due_date);
      data.append('product_image', imageFile);

      await api.post('/tasks/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Task created successfully!");
      router.push('/admin/tasks');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create task");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* TOP BAR */}

      <div
        className="
        flex
        items-center
        justify-between
        mb-8
        "
      >
        <div>
          <Link
            href="/admin/tasks"
            className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-zinc-500
            dark:text-zinc-400
            hover:text-zinc-900
            dark:hover:text-white
            transition-colors
            mb-4
            "
          >
            <ArrowLeft size={16} />

            Back to Tasks
          </Link>

          <h1
            className="
            text-2xl
            font-bold
            text-zinc-900
            dark:text-white
            "
          >
            Create New Task
          </h1>

          <p
            className="
            mt-2
            text-sm
            text-zinc-500
            dark:text-zinc-400
            "
          >
            Assign AI product image generation
            work to your team members.
          </p>
        </div>
      </div>

      {/* FORM */}

      <div
        className="
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-8
        "
      >
        
        {/* LEFT SIDE */}

        <div
          className="
          lg:col-span-2
          space-y-6
          "
        >
          
          {/* TASK DETAILS */}

          <div
            className="
            rounded-3xl
            border
            border-zinc-200
            dark:border-white/5
            bg-white
            dark:bg-[#1f1d1c]
            p-6
            "
          >
            <h2
              className="
              text-lg
              font-semibold
              text-zinc-900
              dark:text-white
              mb-6
              "
            >
              Task Details
            </h2>

            <div className="space-y-5">
              
              {/* TITLE */}

              <div>
                <label
                  className="
                  block
                  mb-2
                  text-sm
                  font-medium
                  text-zinc-700
                  dark:text-zinc-300
                  "
                >
                  Task Title
                </label>

                <input
                  type="text"
                  placeholder="Luxury handbag campaign..."
                  value={formData.task_title}
                  onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
                  className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  border
                  border-zinc-200
                  dark:border-white/5
                  bg-zinc-50
                  dark:bg-[#262423]
                  text-sm
                  text-zinc-900
                  dark:text-white
                  outline-none
                  focus:ring-2
                  focus:ring-[#8b5e3c]
                  "
                />
              </div>

              <div>
                <label
                  className="
                  block
                  mb-2
                  text-sm
                  font-medium
                  text-zinc-700
                  dark:text-zinc-300
                  "
                >
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="White Luxury handbag"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  border
                  border-zinc-200
                  dark:border-white/5
                  bg-zinc-50
                  dark:bg-[#262423]
                  text-sm
                  text-zinc-900
                  dark:text-white
                  outline-none
                  focus:ring-2
                  focus:ring-[#8b5e3c]
                  "
                />
              </div>

              <div>
                <label
                  className="
                  block
                  mb-2
                  text-sm
                  font-medium
                  text-zinc-700
                  dark:text-zinc-300
                  "
                >
                  Product's belonging gender
                </label>

                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  border
                  border-zinc-200
                  dark:border-white/5
                  bg-zinc-50
                  dark:bg-[#262423]
                  text-sm
                  text-zinc-900
                  dark:text-white
                  outline-none
                  focus:ring-2
                  focus:ring-[#8b5e3c]
                  "
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              {/* DESCRIPTION */}

              {/* <div>
                <label
                  className="
                  block
                  mb-2
                  text-sm
                  font-medium
                  text-zinc-700
                  dark:text-zinc-300
                  "
                >
                  Task Description
                </label>

                <textarea
                  rows={5}
                  placeholder="Describe the product photography requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  border
                  border-zinc-200
                  dark:border-white/5
                  bg-zinc-50
                  dark:bg-[#262423]
                  text-sm
                  text-zinc-900
                  dark:text-white
                  outline-none
                  resize-none
                  focus:ring-2
                  focus:ring-[#8b5e3c]
                  "
                />
              </div> */}

              {/* ASSIGN USER + DEADLINE */}

              <div
                className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
                "
              >
                
                <div>
                  <label
                    className="
                    block
                    mb-2
                    text-sm
                    font-medium
                    text-zinc-700
                    dark:text-zinc-300
                    "
                  >
                    Assign User Email
                  </label>

                  <input
                    type="email"
                    list="users-list"
                    placeholder="user@example.com"
                    value={formData.assigned_user_email}
                    onChange={(e) => setFormData({ ...formData, assigned_user_email: e.target.value })}
                    className="
                    w-full
                    px-4
                    py-3
                    rounded-2xl
                    border
                    border-zinc-200
                    dark:border-white/5
                    bg-zinc-50
                    dark:bg-[#262423]
                    text-sm
                    text-zinc-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#8b5e3c]
                    "
                  />
                  <datalist id="users-list">
                    {users.map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.full_name}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label
                    className="
                    block
                    mb-2
                    text-sm
                    font-medium
                    text-zinc-700
                    dark:text-zinc-300
                    "
                  >
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="
                    w-full
                    px-4
                    py-3
                    rounded-2xl
                    border
                    border-zinc-200
                    dark:border-white/5
                    bg-zinc-50
                    dark:bg-[#262423]
                    text-sm
                    text-zinc-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#8b5e3c]
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-6">
          
          {/* PRODUCT IMAGE */}

          <div
            className="
            rounded-3xl
            border
            border-zinc-200
            dark:border-white/5
            bg-white
            dark:bg-[#1f1d1c]
            p-6
            "
          >
            <h2
              className="
              text-lg
              font-semibold
              text-zinc-900
              dark:text-white
              mb-5
              "
            >
              Product Image
            </h2>

            <label
              className="
              relative
              flex
              flex-col
              items-center
              justify-center
              h-72
              rounded-3xl
              border-2
              border-dashed
              border-zinc-300
              dark:border-white/10
              bg-zinc-50
              dark:bg-[#262423]
              cursor-pointer
              overflow-hidden
              "
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="
                  w-full
                  h-full
                  object-cover
                  "
                />
              ) : (
                <div
                  className="
                  flex
                  flex-col
                  items-center
                  text-center
                  px-4
                  "
                >
                  <UploadCloud
                    size={40}
                    className="
                    text-zinc-400
                    mb-4
                    "
                  />

                  <p
                    className="
                    text-sm
                    font-medium
                    text-zinc-700
                    dark:text-zinc-300
                    "
                  >
                    Upload Product Image
                  </p>

                  <p
                    className="
                    mt-2
                    text-xs
                    text-zinc-500
                    dark:text-zinc-400
                    "
                  >
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* SUBMIT */}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="
            w-full
            py-4
            rounded-2xl
            bg-[#8b5e3c]
            hover:bg-[#a06c45]
            text-white
            font-medium
            transition-all
            shadow-lg
            "
          >
            {isLoading ? "Assigning" : "Create & Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
}