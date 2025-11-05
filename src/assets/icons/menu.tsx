import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const MenuIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.5 6.5h15M4.5 12h15m-15 5.5h15"
    />
  </Svg>
)
export default MenuIcon
