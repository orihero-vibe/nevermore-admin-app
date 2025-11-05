import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const PlayIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 36}
    height={props.height || 36}
    viewBox="0 0 36 36"
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#fff"}
      d="M29.064 18.625 13.165 29.224A.75.75 0 0 1 12 28.6V7.402a.75.75 0 0 1 1.165-.624l15.899 10.599a.75.75 0 0 1 0 1.248Z"
    />
  </Svg>
)
export default PlayIcon
