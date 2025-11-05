import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const BookmarkIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 14}
    height={props.height || 17}
    fill="none"
    viewBox="0 0 14 17"
    {...props}
  >
    <Path
      fill={props.color || "#fff"}
      d="m7 15-4.2 1.8c-.667.283-1.3.23-1.9-.163-.6-.391-.9-.945-.9-1.662V2C0 1.45.196.98.588.587A1.926 1.926 0 0 1 2 0h10c.55 0 1.02.196 1.412.588C13.804.979 14 1.45 14 2v12.975c0 .717-.3 1.27-.9 1.662-.6.392-1.233.446-1.9.163L7 15Zm0-2.2 5 2.15V2H2v12.95l5-2.15Z"
    />
  </Svg>
)
export default BookmarkIcon
