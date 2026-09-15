import React from 'react';
import Header from '@cloudscape-design/components/header';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ text: string; href: string }>;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <SpaceBetween size="xs">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbGroup
          items={breadcrumbs}
          ariaLabel="Breadcrumbs"
          onFollow={(e) => e.preventDefault()}
        />
      )}
      <Header
        variant="h1"
        description={description}
        actions={actions}
      >
        {title}
      </Header>
    </SpaceBetween>
  );
}
