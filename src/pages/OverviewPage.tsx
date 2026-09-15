import { useNavigate } from 'react-router-dom';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

const RESEARCH_QUESTION =
  'How do register-based and stack-based instruction set architectures differ in' +
  ' program representation and execution behavior when executing equivalent workloads?';

const METRICS: { label: string; note?: string }[] = [
  { label: 'Program Size (bytes)' },
  { label: 'Dynamic Instruction Count' },
  { label: 'Memory Reads' },
  { label: 'Memory Writes' },
  { label: 'Branch Activity' },
  { label: 'Stack Activity', note: 'stack machine only' },
  { label: 'Estimated Execution Cost' },
];

export default function OverviewPage() {
  const navigate = useNavigate();

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Study the tradeoffs between register-based and stack-based instruction set architectures by running equivalent workloads on both virtual machines and comparing execution metrics side-by-side."
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate('/execute')}>Execute Program</Button>
              <Button onClick={() => navigate('/compare')}>Compare Architectures</Button>
              <Button variant="primary" onClick={() => navigate('/benchmarks')}>
                Run Benchmarks
              </Button>
            </SpaceBetween>
          }
        >
          Interactive ISA Laboratory
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Research Question */}
        <Container
          header={
            <Header variant="h2">Primary Research Question</Header>
          }
        >
          <Box variant="p" fontSize="body-m" color="text-body-secondary">
            {RESEARCH_QUESTION}
          </Box>
        </Container>

        {/* Architecture Descriptions */}
        <SpaceBetween size="s">
          <Box variant="h2">Architecture Overview</Box>
          <ColumnLayout columns={2} variant="default">
            <Container
              header={<Header variant="h3">Register Machine</Header>}
            >
              <SpaceBetween size="s">
                <Box variant="p">
                  The register machine uses a fixed bank of <strong>8 × 16-bit general-purpose
                  registers</strong> (R0–R7) as its primary operand storage. All arithmetic,
                  logic, and data-movement instructions reference registers explicitly by name.
                </Box>
                <SpaceBetween size="xxs">
                  <Box variant="h4">Characteristics</Box>
                  <ul>
                    <li>
                      <Box variant="p">
                        <strong>Explicit operand encoding</strong> — every instruction encodes
                        its source and destination registers directly in the instruction word.
                      </Box>
                    </li>
                    <li>
                      <Box variant="p">
                        <strong>Longer instructions</strong> — register specifier fields and
                        immediate values make individual instructions wider than stack equivalents.
                      </Box>
                    </li>
                    <li>
                      <Box variant="p">
                        <strong>Explicit data flow</strong> — the movement of values between
                        registers is fully visible in the instruction stream.
                      </Box>
                    </li>
                  </ul>
                </SpaceBetween>
              </SpaceBetween>
            </Container>

            <Container
              header={<Header variant="h3">Stack Machine</Header>}
            >
              <SpaceBetween size="s">
                <Box variant="p">
                  The stack machine uses an <strong>implicit operand stack</strong> as its only
                  working storage. Instructions do not reference operand locations; they always
                  consume values from and produce values at the top of the stack.
                </Box>
                <SpaceBetween size="xxs">
                  <Box variant="h4">Characteristics</Box>
                  <ul>
                    <li>
                      <Box variant="p">
                        <strong>Compact instruction encoding</strong> — no operand fields are
                        needed, so most instructions fit in a single byte.
                      </Box>
                    </li>
                    <li>
                      <Box variant="p">
                        <strong>Operands consumed at top of stack</strong> — arithmetic and logic
                        instructions pop their inputs and push the result automatically.
                      </Box>
                    </li>
                    <li>
                      <Box variant="p">
                        <strong>Implicit data flow</strong> — values pass between operations
                        through the stack, invisible in the instruction encoding itself.
                      </Box>
                    </li>
                  </ul>
                </SpaceBetween>
              </SpaceBetween>
            </Container>
          </ColumnLayout>
        </SpaceBetween>

        {/* Research Metrics */}
        <Container
          header={
            <Header
              variant="h2"
              description="All seven metrics are collected for every program execution and used as the basis for architecture comparison."
            >
              Tracked Research Metrics
            </Header>
          }
        >
          <ColumnLayout columns={2} variant="default">
            {METRICS.map(({ label, note }) => (
              <Box key={label} variant="p">
                <strong>{label}</strong>
                {note && (
                  <Box variant="small" color="text-body-secondary" display="inline">
                    {' '}— {note}
                  </Box>
                )}
              </Box>
            ))}
          </ColumnLayout>
        </Container>

        {/* Disclaimer */}
        <Box variant="small" color="text-body-secondary">
          <strong>Note:</strong> Estimated Execution Cost values are abstract analytical figures
          produced by a simplified virtual machine model. They do not represent real processor
          cycle counts or wall-clock timing measurements from physical hardware.
        </Box>
      </SpaceBetween>
    </ContentLayout>
  );
}
