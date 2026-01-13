import express, { Request, Response } from "express";
import thumbnailModel from "../model/Thumbnail";
import replicate from "../config/replicate";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const {
      title,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      prompt: user_prompt,
    } = req.body;

    // Create DB entry first
    const thumbnail = await thumbnailModel.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // Build prompt
    let prompt = `Create a ${
      stylePrompts[style as keyof typeof stylePrompts]
    } for: "${title}". `;
    if (color_scheme) {
      prompt += `Use a ${
        colorSchemeDescriptions[
          color_scheme as keyof typeof colorSchemeDescriptions
        ]
      } color scheme. `;
    }
    if (user_prompt) {
      prompt += `Additional details: ${user_prompt}. `;
    }
    prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;
    const input = {
      prompt,
      aspect_ratio: aspect_ratio || "16:9",
      output_format: "jpg",
      safety_filter_level: "block_medium_and_above",
    };
    const output: any = await replicate.run("google/imagen-4", { input });

    // Extract image URL correctly
    const imageUrl = output.url()

    if (!imageUrl) {
      throw new Error("Image generation failed: No image URL returned");
    }

    console.log("Generated image URL:", imageUrl);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageUrl.href, {
      resource_type: "image",
    });

    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    return res.json({
      message: "Thumbnail Generated Successfully",
      thumbnail,
    });
  } catch (error: any) {
    console.error(error);

    // Optional: set isGenerating = false if DB entry exists
    if (req.session && req.session.userId) {
      await thumbnailModel.updateMany(
        { userId: req.session.userId, isGenerating: true },
        { isGenerating: false }
      );
    }

    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;
    await thumbnailModel.findByIdAndDelete({ _id: id, userId });

    res.json({
      message: "Thumbnail Deleted Successfully",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};
