import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const PauseIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 36}
    height={props.height || 36}
    viewBox="0 0 26 26"
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#fff"}
      d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
    />
  </Svg>
)

export default PauseIcon



