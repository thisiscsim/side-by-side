import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  width?: string | number
  height?: string | number
}

function Skeleton({ 
  className, 
  width, 
  height, 
  style,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-skeleton-loading",
        "rounded",
        className
      )}
      style={{
        width: width || "100%",
        height: height || "24px",
        backgroundImage: "linear-gradient(270deg, #fafafa, #e5e5e5, #e5e5e5, #fafafa)",
        backgroundSize: "400% 100%",
        ...style
      }}
      {...props}
    />
  )
}

export { Skeleton }
