type ServiceLpImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ServiceLpImage({ src, alt, className }: ServiceLpImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
    />
  );
}
