import type React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';

interface AppShellProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  navigationOpen?: boolean;
  navigationWidth?: number;
  onNavigationChange?: (open: boolean) => void;
}

export default function AppShell({
  children,
  navigation,
  navigationOpen = false,
  navigationWidth = 220,
  onNavigationChange,
}: AppShellProps) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        [class*="awsui_content-header_"] { pointer-events: none; }
        [class*="awsui_content-header_"]:hover { background: transparent !important; }
        #h [class*="awsui_top-navigation_"] { border-bottom: 2px solid #0972d3; }
      `}</style>

      <div id="h" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
        <TopNavigation
          identity={{
            href: '/',
            title: 'Interactive ISA Laboratory',
            logo: { src: '/CPU.jpg', alt: 'CPU icon' },
            onFollow: (e) => { e.preventDefault(); navigate('/'); },
          }}
          utilities={[
            { type: 'button', text: 'Register vs Stack Virtual Computer', disableUtilityCollapse: true },
            { type: 'button', text: 'CSCI 411', disableUtilityCollapse: true },
          ]}
          i18nStrings={{
            searchIconAriaLabel: 'Search',
            searchDismissIconAriaLabel: 'Close search',
            overflowMenuTriggerText: 'More',
            overflowMenuTitleText: 'All',
            overflowMenuBackIconAriaLabel: 'Back',
            overflowMenuDismissIconAriaLabel: 'Close menu',
          }}
        />
      </div>

      <AppLayout
        headerSelector="#h"
        content={children}
        navigation={navigation}
        navigationOpen={navigationOpen}
        navigationWidth={navigationWidth}
        toolsHide
        onNavigationChange={({ detail }) => onNavigationChange?.(detail.open)}
        ariaLabels={{
          navigation:       'Analysis panels',
          navigationToggle: 'Open analysis panels',
          navigationClose:  'Close analysis panels',
          notifications:    'Notifications',
          tools:            'Help panel',
          toolsToggle:      'Open help panel',
          toolsClose:       'Close help panel',
        }}
      />
    </>
  );
}
