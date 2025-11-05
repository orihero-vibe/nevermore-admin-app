import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const ChevronLeftIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 18l-6-6 6-6"
    />
  </Svg>
)

export default ChevronLeftIcon

