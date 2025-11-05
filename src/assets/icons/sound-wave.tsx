import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

const SoundWaveIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#965CDF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 12h4l4-4v12l-4-4H2zM12 8v8M16 6v12M20 4v16"
    />
  </Svg>
)

export default SoundWaveIcon
