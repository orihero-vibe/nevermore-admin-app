import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const StopButtonIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 36}
    height={props.height || 36}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#fff"}
      d="M9 7.5h18A1.5 1.5 0 0 1 28.5 9v18a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 27V9A1.5 1.5 0 0 1 9 7.5Z"
    />
  </Svg>
)
export default StopButtonIcon
