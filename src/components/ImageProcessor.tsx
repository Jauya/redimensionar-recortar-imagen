import React, { useState } from "react";
import { ZipCompressor } from "../utils/zipCompressor";
import { processImage } from "../utils/imageProcessor";

interface ImageFile {
  file: File;
}

interface AspectRatio {
  value: string;
  label: string;
}

export default function ImageProcessor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("1:1");
  const [outputSize, setOutputSize] = useState<number>(1080);
  const [imageQuality, setImageQuality] = useState<number>(0.8);
  const aspectRatios: AspectRatio[] = [
    { value: "1:1", label: "1:1" },
    { value: "4:3", label: "4:3" },
    { value: "3:4", label: "3:4" },
    { value: "3:2", label: "3:2" },
    { value: "2:3", label: "2:3" },
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" },
    { value: "21:9", label: "21:9" },
    { value: "1:2", label: "1:2" },
    { value: "2:1", label: "2:1" },
  ];
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };
  const createZip = async () => {
    try {
      setIsProcessing(true);

      // Process each image with the selected aspect ratio and size
      const processedImages: File[] = await Promise.all(
        images.map(async (img) => {
          const processedBlob = await processImage(img.file, {
            aspectRatio: selectedAspectRatio,
            outputSize: outputSize,
            quality: imageQuality,
          });

          // Create a new File with the processed image
          return new File([processedBlob], img.file.name, {
            type: "image/jpeg",
          });
        })
      );

      // Compress the processed images
      const zipBlob = await ZipCompressor.compressFiles(processedImages);

      // Create a download link and trigger download
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagenes_${outputSize}px_${selectedAspectRatio}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clean up
      setImages([]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col gap-4 bg-slate-800 p-4 rounded-lg">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={isProcessing}
          className="block w-full text-sm text-slate-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-700 file:text-blue-50
            hover:file:bg-blue-600"
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <span className="text-sm text-slate-400 font-semibold">
              Aspecto:
            </span>
          </div>
          <div className="flex flex-col gap-2 pb-2 overflow-x-auto">
            <div className="flex gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setSelectedAspectRatio(ratio.value)}
                  className={`
                      flex flex-col items-center
                      px-4 py-2
                      rounded-md
                      transition-colors
                      font-semibold
                      ${
                        selectedAspectRatio === ratio.value
                          ? "bg-slate-700 text-white/70"
                          : "text-slate-400 hover:bg-slate-700"
                      }
                    `}
                >
                  <div className="size-10 justify-center items-end flex">
                    <div
                      className={`
                        border-2
                        border-white/70
                        ${ratio.value === "1:1" && "size-6"}
                        ${ratio.value === "4:3" && "w-8 h-6"}
                        ${ratio.value === "3:4" && "w-6 h-8"}
                        ${ratio.value === "3:2" && "w-8 h-5.25"}
                        ${ratio.value === "2:3" && "w-5.25 h-8"}
                        ${ratio.value === "16:9" && "w-8 h-4.5"}
                        ${ratio.value === "21:9" && "w-8 h-3.5"}
                        ${ratio.value === "9:16" && "w-4.5 h-8"}
                        ${ratio.value === "1:2" && "w-4 h-8"}
                        ${ratio.value === "2:1" && "w-8 h-4"}
                      `}
                    />
                  </div>
                  <span className="text-xs mt-1">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-8 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 font-semibold">
                Anchura (px):
              </span>
              <input
                type="number"
                value={outputSize}
                onChange={(e) => setOutputSize(Number(e.target.value))}
                min="100"
                max="10000"
                step="10"
                className="w-24 h-8 text-sm text-slate-400 bg-slate-700 rounded-md px-2 py-1 border border-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 font-semibold">
                Calidad (0.1-1.0):
              </span>
              <input
                type="number"
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
                min="0.1"
                max="1.0"
                step="0.1"
                className="w-24 h-8 text-sm text-slate-400 bg-slate-700 rounded-md px-2 py-1 border border-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <button
          onClick={createZip}
          disabled={isProcessing || images.length === 0 || !outputSize}
          className={
            "w-full h-10 text-sm text-blue-50 bg-blue-700 rounded-md hover:bg-blue-600 disabled:bg-slate-700" +
            (isProcessing ? " animate-pulse" : "")
          }
        >
          {isProcessing
            ? "Procesando imágenes..."
            : images.length > 0 && outputSize
            ? "Procesar imágenes"
            : "Selecciona imágenes y tamaño"}
        </button>
      </div>
    </div>
  );
}
