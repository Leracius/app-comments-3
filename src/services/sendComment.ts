import axios from "axios";
import { Comment } from "../types";

const url = "https://chat-comments-backend-production.up.railway.app/api/msg";

export const getComments = async () => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {}
};

export const uploadComment = async (comment: Comment) => {
  try {
    const response = await axios.post(url, comment);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
