"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Annotation = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
};

type ImageInfo = {
  id: string;
  name: string;
  width: number;
  height: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [images, setImages] = useState<File[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<string | null>(null);

  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentBox, setCurrentBox] = useState<Partial<Annotation> | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("unlabeled");
  const [zoom, setZoom] = useState(1);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTopic, setChatTopic] = useState<"disease" | "medicine">("disease");
  const [chatInput, setChatInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hello! How can I help you with your annotations today?" }
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleLogout = async () => {
    try {
      // --- CÁCH GỌI API THẬT CHO HÔM SAU ---
      // const token = localStorage.getItem("token");
      // await fetch("http://localhost:8000/api/logout", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`
      //   }
      // });
      // localStorage.removeItem("token");
      // -------------------------------------

      // --- MOCK DATA GIẢ CHO HÔM NAY ---
      const MOCK_DELAY = 500;
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      
      router.push("/login"); // Redirect to login page on logout
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      router.push("/login"); // Vẫn cho phép về login dù lỗi
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const newUrl = URL.createObjectURL(selectedFiles[0]);
      setSourceUrl(newUrl);
      setAnalyzedUrl(null); // Clear the right side
      // Reset for new image
      setAnnotations([]);
      setImageInfo(null);
      setIsAnalyzing(false);
      setZoom(1);
    }
  };

  const handleSourceImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (images.length > 0) {
      setImageInfo({
        id: Date.now().toString(),
        name: images[0].name,
        width: naturalWidth,
        height: naturalHeight,
      });
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (images.length > 0) {
      setImageInfo({
        id: Date.now().toString(),
        name: images[0].name,
        width: naturalWidth,
        height: naturalHeight,
      });
    }
    resizeCanvas();
  };

  const handleAnalyzeImage = async () => {
    if (images.length === 0 || !imageInfo) return;
    const file = images[0];
    const naturalWidth = imageInfo.width;
    const naturalHeight = imageInfo.height;
    
    setIsAnalyzing(true);
    setAnalyzedUrl(sourceUrl); // Move image to the right side
    
    try {
      // --- CÁCH GỌI API THẬT CHO HÔM SAU ---
      // const formData = new FormData();
      // formData.append("file", file); // Đính file ảnh upload lên server
      // 
      // const response = await fetch("http://localhost:8000/api/analyze-image", {
      //   method: "POST",
      //   body: formData,
      // });
      // const data = await response.json();
      // -------------------------------------
      
      // --- MOCK DATA GIẢ CHO HÔM NAY ---
      const MOCK_API_DELAY = 2000;
      const mockResponse: any = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            // image_url: "https://your-processed-image.jpg" // Nếu FE cần thay thế bằng ảnh server trả về thì gỡ comment này ra và gán cho previewUrl
            annotations: [
              {
                x1: Math.floor(naturalWidth * 0.2),
                y1: Math.floor(naturalHeight * 0.25),
                x2: Math.floor(naturalWidth * 0.45),
                y2: Math.floor(naturalHeight * 0.55),
                label: "Tumor (Malignant)",
              },
              {
                x1: Math.floor(naturalWidth * 0.55),
                y1: Math.floor(naturalHeight * 0.1),
                x2: Math.floor(naturalWidth * 0.75),
                y2: Math.floor(naturalHeight * 0.35),
                label: "Lesion (Benign)",
              }
            ]
          });
        }, MOCK_API_DELAY);
      });
      
      // Assign ID dynamically and update state
      const newBoxes: Annotation[] = mockResponse.annotations.map((box: any, index: number) => ({
        id: Date.now().toString() + "-" + index,
        x1: box.x1,
        y1: box.y1,
        x2: box.x2,
        y2: box.y2,
        label: box.label,
      }));
      
      // Nếu API server trả về kèm 1 link ảnh đã xử lý, bạn có thể uncomment dòng dưới:
      // if (mockResponse.image_url) setPreviewUrl(mockResponse.image_url);

      // Thay vì nối vào (prev => [...prev, ...newBoxes]), chúng ta thay thế hoàn toàn
      setAnnotations(newBoxes);
    } catch (error) {
      console.error("Lỗi khi tải dự đoán từ Model:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resizeCanvas = () => {
    if (canvasRef.current && imageRef.current) {
      canvasRef.current.width = imageRef.current.clientWidth;
      canvasRef.current.height = imageRef.current.clientHeight;
      drawAnnotations();
    }
  };

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [annotations, currentBox]);

  useEffect(() => {
    drawAnnotations();
  }, [annotations, currentBox, imageInfo]);

  const toNatural = (displayX: number, displayY: number) => {
    if (!imageRef.current || !imageInfo) return { x: 0, y: 0 };
    const ratioX = imageInfo.width / imageRef.current.width;
    const ratioY = imageInfo.height / imageRef.current.height;
    return {
      x: Math.round(displayX * ratioX),
      y: Math.round(displayY * ratioY),
    };
  };

  const toDisplay = (naturalX: number, naturalY: number) => {
    if (!imageRef.current || !imageInfo) return { x: 0, y: 0 };
    const ratioX = imageRef.current.width / imageInfo.width;
    const ratioY = imageRef.current.height / imageInfo.height;
    return {
      x: naturalX * ratioX,
      y: naturalY * ratioY,
    };
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const naturalPos = toNatural(pos.x, pos.y);
    setIsDrawing(true);
    setCurrentBox({
      id: Date.now().toString(),
      x1: naturalPos.x,
      y1: naturalPos.y,
      x2: naturalPos.x,
      y2: naturalPos.y,
      label: selectedLabel,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentBox) return;
    const pos = getMousePos(e);
    const naturalPos = toNatural(pos.x, pos.y);
    setCurrentBox((prev) =>
      prev
        ? {
            ...prev,
            x2: naturalPos.x,
            y2: naturalPos.y,
          }
        : null
    );
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox) {
      const newBox = {
        ...currentBox,
        x1: Math.min(currentBox.x1!, currentBox.x2!),
        y1: Math.min(currentBox.y1!, currentBox.y2!),
        x2: Math.max(currentBox.x1!, currentBox.x2!),
        y2: Math.max(currentBox.y1!, currentBox.y2!),
      } as Annotation;

      // Save if area is big enough (prevent accidental clicks)
      if (newBox.x2 - newBox.x1 > 5 && newBox.y2 - newBox.y1 > 5) {
        setAnnotations((prev) => [...prev, newBox]);
      }
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved annotations
    annotations.forEach((box) => {
      const p1 = toDisplay(box.x1, box.y1);
      const p2 = toDisplay(box.x2, box.y2);

      ctx.strokeStyle = "#3b82f6"; // blue
      ctx.lineWidth = 2;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

      // Label background (optional)
      const text = box.label;
      ctx.font = "12px sans-serif";
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(p1.x, p1.y > 20 ? p1.y - 18 : p1.y + 2, textWidth + 8, 18);
      
      // Label text
      ctx.fillStyle = "white";
      ctx.fillText(text, p1.x + 4, p1.y > 20 ? p1.y - 5 : p1.y + 15);
    });

    // Draw drawing box
    if (isDrawing && currentBox) {
      const p1 = toDisplay(currentBox.x1!, currentBox.y1!);
      const p2 = toDisplay(currentBox.x2!, currentBox.y2!);

      ctx.strokeStyle = "#10b981"; // green
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.setLineDash([]);
    }
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const handleExportJSON = async () => {
    if (!imageInfo) return;
    
    // Copy annotations so we don't modify the state directly
    const exportAnnotations = [...annotations];

    // If no boxes were drawn but a label was selected (other than unlabeled),
    // save it as an image-level label inside the annotations array
    if (exportAnnotations.length === 0 && selectedLabel !== "unlabeled") {
        exportAnnotations.push({
            id: Date.now().toString(),
            label: selectedLabel,
        } as Annotation); // Cast to Annotation to satisfy type, missing x1/etc will just be omitted in JSON
    }

    const exportData: any = {
      image: imageInfo,
      annotations: exportAnnotations.map(a => {
        // Only include x1/etc if they exist (handling the image-level label case)
        if (a.x1 !== undefined) {
           return a;
        }
        return {
           id: a.id,
           label: a.label
        }
      }),
      exportedAt: new Date().toISOString(),
    };

    setIsExporting(true);

    try {
      // --- CÁCH GỌI API THẬT CHO HÔM SAU ---
      // const response = await fetch("http://localhost:8000/api/save-annotations", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(exportData),
      // });
      // if (!response.ok) throw new Error("Gửi dữ liệu lên API thất bại");
      // // const data = await response.json();
      // -------------------------------------

      // --- MOCK DATA GIẢ CHO HÔM NAY ---
      const MOCK_DELAY = 1000;
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      
      // Sau khi gọi API thành công (hoặc giả lập xong), vẫn cho phép tải file JSON cục bộ
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `annotations_${imageInfo.name}.json`
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      alert("Đã lưu dữ liệu qua API và tải file JSON thành công!");
    } catch (error) {
      console.error("Lỗi khi Export JSON:", error);
      alert("Đã xảy ra lỗi khi lưu dữ liệu.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatInput("");

    try {
      // --- CÁCH GỌI API THẬT CHO HÔM SAU ---
      // const response = await fetch("http://localhost:8000/api/chat", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     message: userMessage,
      //     topic: chatTopic 
      //   }),
      // });
      // const data = await response.json();
      // const botReply = data.reply;
      // -------------------------------------

      // --- MOCK DATA GIẢ CHO HÔM NAY ---
      const MOCK_DELAY = 1000;
      const mockResponse: any = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            reply: chatTopic === "disease" 
              ? `Bác sĩ AI (Bệnh học): Đây là câu trả lời mô phỏng cho câu hỏi "${userMessage}"`
              : `Dược sĩ AI (Thuốc): Đây là câu trả lời mô phỏng cho câu hỏi "${userMessage}"`
          });
        }, MOCK_DELAY);
      });
      const botReply = mockResponse.reply;

      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: botReply },
      ]);
    } catch (error) {
      console.error("Lỗi khi gọi Chatbot API:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: "Xin lỗi, đã có lỗi kết nối đến server AI." },
      ]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white/75 backdrop-blur-md">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-gray-900 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white">
              <span className="text-sm font-bold">M</span>
            </div>
            Medical Annotation Tool
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chatbot
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex h-9 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Image Upload box */}
          <div className={`rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center border-dashed border-2 ${sourceUrl ? "p-4" : "p-6"} h-[500px]`}>
            {!sourceUrl && (
              <div className="flex flex-col items-center gap-3 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <div className="space-y-1">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                >
                  <span>Upload medical images</span>
                  <input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                  />
                </label>
                <p className="text-sm text-gray-500">
                  PNG, JPG, DICOM up to 10MB
                </p>
              </div>
            </div>
            )}
            {sourceUrl && (
              <div className="flex flex-col items-center gap-4 w-full flex-1 min-h-0">
                <img 
                  src={sourceUrl} 
                  alt="Source Thumbnail" 
                  onLoad={handleSourceImageLoad}
                  className="w-full h-full object-contain rounded-md bg-gray-50 flex-1 min-h-0"
                />
                <div className="flex items-center justify-between w-full px-2">
                  <div className="text-sm text-gray-600 truncate max-w-[60%]">
                    {images[0]?.name}
                  </div>
                  <label
                    htmlFor="image-upload-change"
                    className="cursor-pointer text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-colors shadow-sm"
                  >
                    Change Image
                    <input
                      id="image-upload-change"
                      type="file"
                      className="sr-only"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
                <button
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing || !imageInfo}
                  className="w-full bg-blue-600 text-white rounded-md py-2 px-4 shadow-sm hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  {isAnalyzing ? "Analyzing..." : "Phân tích bằng AI"}
                </button>
              </div>
            )}
          </div>

          {/* Annotation tools box */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex-1">
            <h3 className="font-semibold text-lg mb-4">Annotation Tools</h3>
            <div className="grid grid-cols-2 gap-3 mb-6 flex-wrap">
              <button className="col-span-1 min-w-[140px] flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-50 text-blue-700 p-3 text-sm font-medium transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                Bounding Box
              </button>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-3">Labels</h4>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="unlabeled"
                    className="accent-blue-600 w-4 h-4 cursor-pointer"
                    checked={selectedLabel === "unlabeled"}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                  />{" "}
                  Unlabeled
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="Tumor (Malignant)"
                    className="accent-red-600 w-4 h-4 cursor-pointer"
                    checked={selectedLabel === "Tumor (Malignant)"}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                  />{" "}
                  Tumor (Malignant)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="Lesion (Benign)"
                    className="accent-green-600 w-4 h-4 cursor-pointer"
                    checked={selectedLabel === "Lesion (Benign)"}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                  />{" "}
                  Lesion (Benign)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="Normal Tissue"
                    className="accent-yellow-600 w-4 h-4 cursor-pointer"
                    checked={selectedLabel === "Normal Tissue"}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                  />{" "}
                  Normal Tissue
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 h-full">
          {/* Preview Image Component */}
          <div className="rounded-xl border border-gray-200 bg-white p-1 shadow-sm flex flex-col h-[500px] bg-gray-900 relative overflow-hidden">
            {analyzedUrl ? (
              <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0 w-full relative">
                <div
                  className="relative transition-transform duration-200 origin-center"
                  style={{ display: "inline-flex", transform: `scale(${zoom})` }}
                >
                  <img
                    ref={imageRef}
                    src={analyzedUrl}
                    alt="Analyzed Preview"
                    onLoad={handleImageLoad}
                    className="max-w-full max-h-[440px] object-contain pointer-events-none block"
                    draggable={false}
                  />
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="absolute top-0 left-0 cursor-crosshair touch-none"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                
                {/* Analyzing Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-white">
                      <svg className="animate-spin h-10 w-10 mb-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium animate-pulse">Model is analyzing...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-50"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p className="mt-2 text-sm">No image loaded</p>
              </div>
            )}

            {/* Zoom Controls Bottom Bar */}
            {analyzedUrl && (
              <div className="shrink-0 flex items-center justify-center bg-black/40 border-t border-white/10 p-2 gap-1 z-20">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded transition-colors" title="Zoom Out">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <div className="flex items-center px-2 text-xs font-medium text-white min-w-[3rem] justify-center select-none">
                  {Math.round(zoom * 100)}%
                </div>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded transition-colors" title="Zoom In">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <div className="w-px bg-white/20 mx-2 h-4 my-auto"></div>
                <button onClick={() => setZoom(1)} className="px-3 py-1 text-white/90 hover:text-white hover:bg-white/20 rounded text-xs font-medium transition-colors" title="Reset Zoom">
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Bounding box data list */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[250px] flex flex-col">
            <h3 className="font-semibold text-lg flex items-center justify-between mb-4">
              Saved Annotations
              <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {annotations.length} boxes
              </span>
            </h3>

            <div className="flex-1 border rounded-md border-gray-100 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-2 max-h-[200px]">
              {annotations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-sm text-gray-500">
                    No bounding box data yet.
                    <br />
                    Draw on the image to create annotations.
                  </p>
                </div>
              ) : (
                <ul className="w-full space-y-2">
                  {annotations.map((box) => (
                    <li
                      key={box.id}
                      className="flex items-center justify-between p-2 bg-white border rounded text-sm hover:border-gray-300 transition-colors"
                    >
                      <span className="flex items-center gap-2 w-1/3 truncate">
                        <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
                        <span className="font-medium truncate" title={box.label}>{box.label}</span>
                      </span>
                      <span className="text-gray-400 font-mono text-xs w-1/2 min-w-1/2">
                        [x:{box.x1}, y:{box.y1}, w:{box.x2 - box.x1}, h:{box.y2 - box.y1}]
                      </span>
                      <button
                        onClick={() => removeAnnotation(box.id)}
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                        title="Delete Annotation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => setAnnotations([])}
                className="flex-1 bg-red-600 text-white rounded-md py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50" 
                disabled={annotations.length === 0 || isAnalyzing}
              >
                Delete All Boxes
              </button>
              <button
                onClick={handleExportJSON}
                disabled={!imageInfo || isExporting}
                className="flex-1 border border-gray-200 text-gray-700 bg-white rounded-md py-2 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Export JSON"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot Panel Modal */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 rounded-xl border border-gray-200 bg-white shadow-xl flex flex-col z-50 overflow-hidden" style={{ height: "450px" }}>
          <div className="flex items-center justify-between bg-black px-4 py-3 text-white shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              AI Assistant
            </h3>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors" title="Close Chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="flex border-b border-gray-200 bg-white">
            <button 
              onClick={() => setChatTopic("disease")}
              className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${chatTopic === 'disease' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Hỏi về Bệnh
            </button>
            <button 
              onClick={() => setChatTopic("medicine")}
              className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${chatTopic === 'medicine' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Hỏi về Thuốc
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">
                    AI
                  </div>
                )}
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-sm" 
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()} 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
