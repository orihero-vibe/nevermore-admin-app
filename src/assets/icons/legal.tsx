import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const LegalIcon = (props: SvgProps) => (
  <Svg
    width={props.width || 24}
    height={props.height || 24}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="m12.37 2.15 9 3.6c.35.14.63.56.63.93V10c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V6.68c0-.37.28-.79.63-.93l9-3.6c.2-.08.54-.08.74 0ZM22 22H2v-3c0-.55.45-1 1-1h18c.55 0 1 .45 1 1v3ZM4 18v-7M8 18v-7M12 18v-7M16 18v-7M20 18v-7M1 22h22"
    />
    <Path
      stroke={props.color || "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M12 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
    />
  </Svg>
)
export default LegalIcon
