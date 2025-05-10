interface ImageProcessingOptions {
  aspectRatio: string;
  outputSize: number;
  quality: number;
}

export async function processImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) {
        reject(new Error('Error al leer la imagen'));
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          const [cropWidth, cropHeight] = calculateCropDimensions(img.width, img.height, options.aspectRatio);
          
          // Crear canvas para el recorte
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropWidth;
          cropCanvas.height = cropHeight;
          const cropCtx = cropCanvas.getContext('2d');
          if (!cropCtx) {
            throw new Error('No se pudo obtener el contexto del canvas');
          }

          // Calcular el área de recorte
          const sourceX = (img.width - cropWidth) / 2;
          const sourceY = (img.height - cropHeight) / 2;

          // Dibujar el área recortada
          cropCtx.drawImage(
            img,
            sourceX, sourceY,
            cropWidth, cropHeight,
            0, 0,
            cropWidth, cropHeight
          );

          // Crear canvas para la imagen final
          const outputCanvas = document.createElement('canvas');
          outputCanvas.width = options.outputSize;
          outputCanvas.height = Math.round(options.outputSize * (cropHeight / cropWidth));
          const outputCtx = outputCanvas.getContext('2d');
          if (!outputCtx) {
            throw new Error('No se pudo obtener el contexto del canvas');
          }

          // Dibujar el recorte escalado
          outputCtx.drawImage(
            cropCanvas,
            0, 0,
            cropWidth, cropHeight,
            0, 0,
            options.outputSize, outputCanvas.height
          );

          // Convertir a Blob
          outputCanvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error al convertir la imagen'));
              }
            },
            'image/jpeg',
            options.quality
          );

        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target.result.toString();
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function calculateCropDimensions(imageWidth: number, imageHeight: number, aspectRatio: string): [number, number] {
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  const aspect = widthRatio / heightRatio;
  
  // Determinar si la imagen es más ancha o más alta que el ratio deseado
  if (imageWidth / imageHeight > aspect) {
    // La imagen es más ancha, recortar los lados
    const newWidth = imageHeight * aspect;
    return [Math.round(newWidth), imageHeight];
  } else {
    // La imagen es más alta, recortar arriba y abajo
    const newHeight = imageWidth / aspect;
    return [imageWidth, Math.round(newHeight)];
  }
}
