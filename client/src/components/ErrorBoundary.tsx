import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Alert type="error" header={`Something went wrong${this.props.fallbackLabel ? ` in ${this.props.fallbackLabel}` : ''}`}>
          <SpaceBetween size="s">
            <Box variant="code" fontSize="body-s">
              {this.state.error.message}
            </Box>
            <Button onClick={() => this.setState({ error: null })}>Retry</Button>
          </SpaceBetween>
        </Alert>
      );
    }
    return this.props.children;
  }
}
