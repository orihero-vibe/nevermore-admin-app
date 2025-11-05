import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const ArrowsIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#8F8F8F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 22v-2M12 18v-2M12 14v-3c0-3.87 3.13-7 7-7h3M2 4h3c3.87 0 7 3.13 7 7v3"
    />
    <Path
      stroke="#8F8F8F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4 2 2 4l2 2M20 2l2 2-2 2"
    />
  </Svg>
)
export default ArrowsIcon
