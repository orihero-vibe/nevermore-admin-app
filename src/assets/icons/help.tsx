import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg"

const HelpIcon = (props: any) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Circle
      cx={12}
      cy={12}
      r={10}
      stroke={props.color || "#fff"}
      strokeWidth={1.5}
    />
    <Path
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
      stroke={props.color || "#fff"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default HelpIcon

