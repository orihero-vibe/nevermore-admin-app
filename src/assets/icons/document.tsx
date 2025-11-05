import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const DocumentIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 24}
    height={props.height || 24}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#8F8F8F"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M22 10v5c0 5-2 7-7 7H9c-5 0-7-2-7-7V9c0-5 2-7 7-7h5"
    />
    <Path
      stroke={props.color || "#8F8F8F"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M22 10h-4c-3 0-4-1-4-4V2l8 8ZM7 13h6M7 17h4"
    />
  </Svg>
)
export default DocumentIcon
