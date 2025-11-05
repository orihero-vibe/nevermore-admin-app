import * as React from "react"

interface CloudUploadIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const CloudUploadIcon = ({ width = 48, height = 48, color = "#fff", className }: CloudUploadIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M32 36H16C10.48 36 6 31.52 6 26C6 20.48 10.48 16 16 16C16.96 12.8 19.76 10.4 23.2 10C24.32 6.48 27.52 4 31.2 4C36.64 4 41 8.36 41 13.8C41 14.48 40.96 15.12 40.88 15.76C43.68 17.04 45.6 19.76 45.6 22.8C45.6 26.64 42.44 29.8 38.6 29.8H32"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 28L24 44"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 34L24 28L30 34"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default CloudUploadIcon

