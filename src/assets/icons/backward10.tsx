import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const BackwardIcon = (props: SvgProps) => (
  <Svg
    width={36}
    height={36}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#fff"}
      d="M18 3c8.285 0 15 6.716 15 15 0 8.285-6.715 15-15 15-8.284 0-15-6.715-15-15h3a12 12 0 1 0 2.797-7.703L12 13.5H3v-9l3.67 3.669A14.97 14.97 0 0 1 18 3Zm3.75 9.375a3.75 3.75 0 0 0-3.75 3.75v3.75a3.75 3.75 0 0 0 7.5 0v-3.75a3.75 3.75 0 0 0-3.75-3.75Zm1.5 3.75v3.75a1.5 1.5 0 1 1-3 0v-3.75a1.5 1.5 0 0 1 3 0ZM15 12.75h-2.25v10.5H15v-10.5Z"
    />
  </Svg>
)
export default BackwardIcon
