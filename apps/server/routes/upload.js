import express from "express";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();

export default function uploadRouter() {
  router.post("/image", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const formData = new FormData();
      formData.append("image", image);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      return res.status(200).json({
        url: response.data.data.url,
      });
    } catch (err) {
      console.error("ImgBB upload failed:", err.message);
      return res.status(500).json({ error: "Image upload failed" });
    }
  });

  return router;
}