import { Button, Group, Stack, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { PageHeader } from '../components/document';
import { SearchIcon } from '../components/icons';
import { openGlobalSearch } from '../layout/global-search';

export function NotFound() {
  return (
    <Stack gap="lg">
      <PageHeader title="Page not found" />
      <Text>There is no page at this address.</Text>
      <Group gap="sm">
        <Button component={Link} to="/">
          Go to the overview
        </Button>
        <Button variant="default" leftSection={<SearchIcon size={16} />} onClick={openGlobalSearch}>
          Search employees
        </Button>
      </Group>
    </Stack>
  );
}
