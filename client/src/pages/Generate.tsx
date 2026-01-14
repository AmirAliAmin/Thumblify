import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  colorSchemes,
  type AspectRatio,
  type IThumbnail,
  type ThumbnailStyle,
} from "../assets/assets";
import SoftBackdrop from "../components/SoftBackdrop";
import AspectRatios from "../components/AspectRatio";
import StyleSelector from "../components/StyleSelector";
import ColorSchameSelector from "../components/ColorSchameSelector";
import PreviewPanel from "../components/PreviewPanel";
import { useAUth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../config/api";

function Generate() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const naviagte = useNavigate();
  const { isLoggedIn } = useAUth();

  const [title, setTitle] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const [thumbnails, setThumbnails] = useState<IThumbnail | null>(null);
  const [loading, setLoading] = useState(false);

  const [aspect, setAspect] = useState<AspectRatio>("16:9");
  const [colorSchemeId, setColorSchemeId] = useState<string>(
    colorSchemes[0].id
  );

  const [style, setStyle] = useState<ThumbnailStyle>("Bold & Graphic");
  const [styleDropDown, setStyleDropDown] = useState(false);

  const handleGenerate = async () => {
    if (!isLoggedIn) return toast.error("user are not Login");
    if (!title.trim()) return toast.error("Enter title please");
    setLoading(true);

    const api_payload = {
      title,
      prompt: additionalDetails,
      style,
      aspect_ratio: aspect,
      color_scheme: colorSchemeId, 
      text_overlay: true,
    };

    const { data } = await api.post("/api/generate/generated", api_payload);
    if (data.thumbnail) {
      naviagte("/generate/" + data.thumbnail._id);
      toast.success("Thumbnail is Generated");
    }
  };

  const fetchThumbnail = async () => {
    try {
      const { data } = await api.get(`/api/user/thumbnail/${id}`);
      setThumbnails(data?.thumbnail as IThumbnail);
      setLoading(!data?.thumbnail?.image_url);
      setAdditionalDetails(data?.thumbnail?.user_prompt);
      setTitle(data?.thumbnail?.title);
      setColorSchemeId(data?.thumbnail?.color_scheme);
      setAspect(data?.thumbnail?.aspect_ratio);
      setStyle(data?.thumbnail?.style);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn && id) {
      fetchThumbnail();
    }
    if (id && loading && isLoggedIn) {
      const interval = setInterval(() => {
        fetchThumbnail();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id, loading, isLoggedIn]);

  useEffect(() => {
    if (!id && thumbnails) {
      setThumbnails(null);
    }
  }, [pathname]);
  return (
    <>
      <SoftBackdrop />
      <div className="pt-24 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* Left Panel */}
            <div className={`space-y-6 ${id && "pointer-events-none"}`}>
              <div className="p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6">
                <div>
                  <h2>Create Your Thumbnail</h2>
                  <p>Describe your vision and let AI bring it to life</p>
                </div>
                <div className="scroll-py-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium"
                    >
                      Title and Topic
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      placeholder="e.g. 10 Tips for Better Sleep"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500 "
                    />
                    <div className="flex items-end justify-end text-xs text-zinc-400">
                      <span>{title.length}/100</span>
                    </div>
                  </div>
                  {/* AspectRatio */}
                  <div className="">
                    <AspectRatios value={aspect} onChange={setAspect} />
                  </div>
                  {/* StyleSelector */}
                  <StyleSelector
                    value={style}
                    onChange={setStyle}
                    isOpen={styleDropDown}
                    setIsOpen={setStyleDropDown}
                  />
                  {/* ColorSchema */}
                  <ColorSchameSelector
                    value={colorSchemeId}
                    onChange={setColorSchemeId}
                  />
                  {/* Details */}
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-zinc-200"
                    >
                      Additional Prompts <span>(optional)</span>
                    </label>
                    <textarea
                      name="title"
                      id="title"
                      placeholder="Add any specfic elements,mood, or style preference"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none "
                    />
                  </div>
                </div>
                {!id && (
                  <button
                    onClick={handleGenerate}
                    className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-700 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Generating..." : "Generate A Thumbnails"}
                  </button>
                )}
              </div>
            </div>
            {/* Right Panel */}
            <div>
              <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                  Preview
                </h2>
                <PreviewPanel
                  thumbnails={thumbnails}
                  loading={loading}
                  aspect={aspect}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Generate;
