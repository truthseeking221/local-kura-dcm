const kuraFullLogoUrl = new URL('../../foundations/assets/kura-full-logo.svg', import.meta.url).href

function KuraAuthLogo() {
  return <img src={kuraFullLogoUrl} alt="Kura" className="block h-auto w-[112px]" />
}

export { KuraAuthLogo }
