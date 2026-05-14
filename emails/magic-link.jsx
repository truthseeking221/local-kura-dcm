import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

/**
 * Magic-link sign-in email. Ships BOTH a 6-digit code and a CTA so the
 * user can finish on whichever device they prefer — and so corporate
 * link-scanners that follow magic links can't burn the token before
 * the user clicks. Both share the same underlying nonce; the backend
 * accepts either path.
 */
export default function MagicLink({
  userName = 'there',
  code = '482915',
  url = 'https://doctor.kura.med/auth/verify?token=demo-token',
  expiresInMinutes = 10,
  requestIp = 'Phnom Penh · iPhone Safari',
}) {
  // Visually split the code into two groups of 3 for legibility.
  const codeLeft = code.slice(0, 3);
  const codeRight = code.slice(3);

  return (
    <Html>
      <Head>
        {/* Hint to clients that we support both color schemes — keeps Apple
            Mail / Outlook from auto-inverting our palette in dark mode. */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </Head>
      <Preview>
        Your Kura sign-in code is {codeLeft} {codeRight} — expires in {expiresInMinutes} min
      </Preview>
      <Tailwind>
        <Body
          className="m-0 p-0"
          style={{
            backgroundColor: '#F6F2EA',
            fontFamily:
              "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          }}
        >
          <Container className="mx-auto my-0 w-full max-w-[520px] px-4 py-10">
            {/* Brand row */}
            <Section className="mb-5">
              <Text
                className="m-0 text-center"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#7C857F',
                  fontWeight: 600,
                }}
              >
                Kura · For Doctors
              </Text>
            </Section>

            {/* Card */}
            <Section
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5DFD3',
                borderRadius: '14px',
                overflow: 'hidden',
              }}
            >
              <Section className="px-10 pt-10 pb-2 text-center">
                <Heading
                  as="h1"
                  className="m-0"
                  style={{
                    fontFamily:
                      "'Fraunces', Georgia, 'Times New Roman', serif",
                    fontSize: '26px',
                    fontWeight: 500,
                    lineHeight: '1.2',
                    color: '#15201A',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Sign in to Kura
                </Heading>
                <Text
                  className="mx-auto mt-3 mb-0"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.55',
                    color: '#4A554F',
                    maxWidth: '380px',
                  }}
                >
                  Hi {userName}, finish signing in by entering the code below
                  on the page you came from, or by tapping the button on this
                  device.
                </Text>
              </Section>

              {/* Code panel */}
              <Section className="px-10 pt-8 pb-2">
                <Section
                  style={{
                    backgroundColor: '#F6F2EA',
                    border: '1px solid #E5DFD3',
                    borderRadius: '10px',
                    padding: '20px 12px',
                    textAlign: 'center',
                  }}
                >
                  <Text
                    className="m-0"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#7C857F',
                      fontWeight: 600,
                      marginBottom: '10px',
                    }}
                  >
                    Your verification code
                  </Text>
                  <Text
                    className="m-0"
                    style={{
                      fontFamily:
                        "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
                      fontSize: '34px',
                      fontWeight: 600,
                      letterSpacing: '0.32em',
                      color: '#15201A',
                      lineHeight: '1.1',
                      // The letter-spacing shifts the visual centre right;
                      // pull it back with the same value of left padding so
                      // the code sits dead-centre in the panel.
                      paddingLeft: '0.32em',
                      // Single click / double-tap selects the entire code in
                      // clients that honour user-select (Apple Mail, web
                      // Gmail, Thunderbird). Outlook desktop ignores it and
                      // falls back to standard text selection — no harm.
                      WebkitUserSelect: 'all',
                      userSelect: 'all',
                      cursor: 'copy',
                    }}
                  >
                    {codeLeft}&nbsp;{codeRight}
                  </Text>
                </Section>
              </Section>

              {/* "or" divider */}
              <Section className="px-10 py-4">
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  role="presentation"
                  style={{ borderCollapse: 'collapse' }}
                >
                  <tr>
                    <td style={{ borderBottom: '1px solid #E5DFD3', width: '45%' }} />
                    <td
                      style={{
                        padding: '0 14px',
                        color: '#7C857F',
                        fontSize: '11px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      or
                    </td>
                    <td style={{ borderBottom: '1px solid #E5DFD3', width: '45%' }} />
                  </tr>
                </table>
              </Section>

              {/* CTA */}
              <Section className="px-10 pb-10 text-center">
                <Button
                  href={url}
                  style={{
                    backgroundColor: '#1F4D3F',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '14px 28px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    letterSpacing: '-0.005em',
                  }}
                >
                  Sign in instantly
                </Button>
                <Text
                  className="m-0"
                  style={{
                    marginTop: '14px',
                    fontSize: '11px',
                    color: '#7C857F',
                  }}
                >
                  Both options expire in {expiresInMinutes} minutes.
                </Text>
              </Section>

              {/* Security notice */}
              <Section
                style={{
                  backgroundColor: '#FBF8F2',
                  borderTop: '1px solid #EFEAE0',
                  padding: '18px 40px',
                }}
              >
                <Text
                  className="m-0 text-center"
                  style={{
                    fontSize: '12px',
                    lineHeight: '1.55',
                    color: '#4A554F',
                  }}
                >
                  Requested from <strong style={{ color: '#15201A' }}>{requestIp}</strong>.
                  If this wasn&apos;t you, ignore this email — your account stays safe.
                  Kura will never ask you to share this code.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="pt-8 pb-2 text-center">
              <Text
                className="m-0"
                style={{
                  fontSize: '11px',
                  color: '#7C857F',
                  lineHeight: '1.6',
                }}
              >
                Kura — the doctor&apos;s cabinet, on the web.
                <br />
                <Link
                  href="https://kura.med"
                  style={{ color: '#2D6B57', textDecoration: 'none' }}
                >
                  kura.med
                </Link>
                {'  ·  '}
                <Link
                  href="https://kura.med/support"
                  style={{ color: '#2D6B57', textDecoration: 'none' }}
                >
                  Support
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

MagicLink.PreviewProps = {
  userName: 'Pierre',
  code: '482915',
  url: 'https://doctor.kura.med/auth/verify?token=demo-token-eyJhbGciOi',
  expiresInMinutes: 10,
  requestIp: 'Phnom Penh · iPhone Safari',
};
