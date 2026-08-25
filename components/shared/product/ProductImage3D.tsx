"use client";

import { CSSProperties, PointerEvent, useState } from "react";

type ProductImage3DProps = {
  src: string;
  alt: string;
};

type Tilt = {
  rotateX: number;
  rotateY: number;
};

const ProductImage3D = ({ src, alt }: ProductImage3DProps) => {
  const [tilt, setTilt] = useState<Tilt>({ rotateX: 0, rotateY: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      rotateX: Number((-y * 10).toFixed(2)),
      rotateY: Number((x * 10).toFixed(2)),
    });
  };

  const imageStyle = {
    transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
  } as CSSProperties;

  return (
    <div
      className="product-image-3d group flex w-full items-center justify-center"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
    >
      <div
        className="product-image-3d__surface w-full"
      >
        <div
          className="w-full transition-transform duration-200 ease-out will-change-transform group-hover:scale-[1.02]"
          style={imageStyle}
        >
          <img
            src={src}
            alt={alt}
            className="block h-auto max-h-[70vh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductImage3D;
