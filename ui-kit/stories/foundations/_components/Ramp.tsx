import { Swatch } from './Swatch.tsx'

type RampProps = {
  /** Token prefix without the trailing dash + stop, e.g. `--brand`. */
  prefix: string
  /** Stop suffixes, e.g. `[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]`. */
  stops: (number | string)[]
}

/** Renders a horizontal grid of swatches for a multi-stop colour ramp. */
export function Ramp({ prefix, stops }: RampProps) {
  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
      {stops.map((stop) => {
        const cssVar = `${prefix}-${stop}`
        const name = `${prefix.replace(/^--/, '')}-${stop}`
        return <Swatch key={String(stop)} name={name} cssVar={cssVar} />
      })}
    </div>
  )
}
