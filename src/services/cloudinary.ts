import axios from "axios";

const url = "https://api.cloudinary.com/v1_1/dbo7lbynt/upload";

export const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "comments-app");
  try {
    const response = await axios.post(url, formData);
    console.log(response);

    return response.data;
  } catch (error) {}
};
