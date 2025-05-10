"use client";

import ImageProcessor from "@/components/ImageProcessor";

export default function Home() {
  return (
    <div className="">
      <main className="flex flex-col items-center mt-16">
        <div className="max-w-4xl w-full justify-center">
          <h1 className="text-3xl font-bold mb-4 px-4 text-white text-center">
            Procesador de Imágenes
          </h1>
          <ImageProcessor />
        </div>
      </main>
    </div>
  );
}
