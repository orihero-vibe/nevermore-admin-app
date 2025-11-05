import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const FlagIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3v18M3 3l4 4-4 4M7 7h14l-4 4 4 4H7"
    />
  </Svg>
)

export default FlagIcon
