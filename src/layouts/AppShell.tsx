/**
 * AppShell — Application chrome for the ISA Laboratory.
 *
 * Single-page layout: TopNavigation header + AppLayout with no side
 * navigation panel (navigationHide). All content lives in LaboratoryPage.
 */

import type React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Sticky top navigation bar */}
      <div id="h" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
        <TopNavigation
          identity={{
            href: '/',
            title: 'Interactive ISA Laboratory',
            onFollow: (e) => { e.preventDefault(); navigate('/'); },
          }}
          utilities={[
            {
              type: 'button',
              text: 'Register vs Stack Virtual Computer',
              disableUtilityCollapse: true,
            },
            {
              type: 'button',
              text: 'CSCI 411',
              disableUtilityCollapse: true,
            },
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

      {/* Main layout — no side navigation on a single-page workspace */}
      <AppLayout
        headerSelector="#h"
        content={children}
        navigationHide={true}
        toolsHide={true}
        ariaLabels={{
          navigation:       'Side navigation',
          navigationToggle: 'Open side navigation',
          navigationClose:  'Close side navigation',
          notifications:    'Notifications',
          tools:            'Help panel',
          toolsToggle:      'Open help panel',
          toolsClose:       'Close help panel',
        }}
      />
    </>
  );
}
