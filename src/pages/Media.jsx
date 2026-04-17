import React, { useEffect, useState } from "react";
import { MdPermMedia } from "react-icons/md";
import { FaRegTrashAlt, FaExternalLinkAlt } from "react-icons/fa";

export default function Media() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [mediaImages, setMediaImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMediaImages();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const fetchMediaImages = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://inoptics.in/api/get_email_media_images.php"
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setMediaImages(data);
      } else if (data.success) {
        setMediaImages(data.data || []);
      } else {
        setMediaImages([]);
      }
    } catch (error) {
      console.error(error);
      setMediaImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      alert("Select image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setUploading(true);

      const res = await fetch(
        "https://inoptics.in/api/upload_email_media_image.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Image uploaded successfully");

        setSelectedImage(null);
        setSelectedImagePreview(null);

        await fetchMediaImages();
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    const confirmDelete = window.confirm("Delete this image?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_email_media_image.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMediaImages((prev) => prev.filter((img) => img.id !== id));
        alert("Image deleted successfully");
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL copied");
    } catch (error) {
      console.error(error);
      alert("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
          <MdPermMedia size={26} className="text-zinc-700" />
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">
            Media Library
          </h2>
          <p className="text-sm text-zinc-500">
            Upload and manage your media files
          </p>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-5">
          Upload Image
        </h3>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-zinc-600
              file:mr-4 file:px-4 file:py-2.5
              file:rounded-xl file:border-0
              file:bg-zinc-900 file:text-white
              hover:file:bg-zinc-800"
            />

            <button
              onClick={handleUploadImage}
              disabled={uploading}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>

          {/* Preview */}
          <div>
            {selectedImagePreview ? (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50">
                <img
                  src={selectedImagePreview}
                  alt="preview"
                  className="w-full h-64 object-cover"
                />
              </div>
            ) : (
              <div className="h-64 border border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
                <MdPermMedia size={38} />
                <p className="text-sm mt-2">Preview appears here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            Uploaded Images
          </h3>

          <span className="text-xs text-zinc-500">
            {mediaImages.length} Files
          </span>
        </div>

        {loading ? (
          <div className="py-14 text-center text-sm text-zinc-400">
            Loading media...
          </div>
        ) : mediaImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {mediaImages.map((img) => (
              <div
                key={img.id}
                className="border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={img.image_url}
                  alt="media"
                  className="w-full h-52 object-cover"
                />

                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => handleCopyUrl(img.image_url)}
                    className="flex-1 h-10 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 flex items-center justify-center gap-2"
                  >
                    <FaExternalLinkAlt size={12} />
                    Copy URL
                  </button>

                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                  >
                    <FaRegTrashAlt size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
            <MdPermMedia size={48} className="text-zinc-300" />
            <p className="text-sm">No media files found</p>
          </div>
        )}
      </div>
    </div>
  );
}