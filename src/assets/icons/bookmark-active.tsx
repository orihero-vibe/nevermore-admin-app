import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const BookmarkActiveIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 30}
    height={props.height || 34}
    viewBox="0 0 14 18"
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#965CDF"}
      d="M0 18V2C0 1.45.196.98.588.587A1.926 1.926 0 0 1 2 0h10c.55 0 1.02.196 1.412.588C13.804.979 14 1.45 14 2v16l-7-3-7 3Z"
    />
  </Svg>
)
export default BookmarkActiveIcon
